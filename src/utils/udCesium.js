import * as math from "mathjs";
import proj4 from 'proj4';
import * as Cesium from 'cesium'


//手动更改更新的频率
let lastTime = 0;
const fps = 50;
const interval = 1000 / fps;
// 使用前需添加指定epsg
proj4.defs("EPSG:4550", "+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
proj4.defs("EPSG:32649", "+proj=utm +zone=49 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:4547", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
proj4.defs("EPSG:4978", "+proj=geocent +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:32645", "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs +type=crs");
function extractTransformComponents(transformationMatrix) {
  const translation = math
    .subset(transformationMatrix, math.index(math.range(0, 3), 3))
    .toArray();
  const scaleMatrix = math.subset(
    transformationMatrix,
    math.index(math.range(0, 3), math.range(0, 3))
  );

  const scale = [
    math.norm(math.subset(scaleMatrix, math.index(0, 0))),
    math.norm(math.subset(scaleMatrix, math.index(1, 1))),
    math.norm(math.subset(scaleMatrix, math.index(2, 2))),
  ];

  const rotationMatrix = math
    .subset(scaleMatrix, math.index(math.range(0, 3), math.range(0, 3)))
    .map((value, index, matrix) => value / scale[index[0]]);

  const trace = math.trace(rotationMatrix);
  const r = math.sqrt(1 + trace);
  const w = r / 2;
  const x = (rotationMatrix.get([2, 1]) - rotationMatrix.get([1, 2])) / (2 * r);
  const y = (rotationMatrix.get([0, 2]) - rotationMatrix.get([2, 0])) / (2 * r);
  const z = (rotationMatrix.get([1, 0]) - rotationMatrix.get([0, 1])) / (2 * r);
  const quaternion = math.matrix([x, y, z, w]);

  return {
    translation,
    scale,
    quaternion,
  };
}

function getRow(A, rowIndex) {
  return math.subset(A, math.index(rowIndex, math.range(0, A.size()[1])));
}

function getColumn(A, columnIndex) {
  return math.subset(A, math.index(math.range(0, A.size()[0]), columnIndex));
}

function normalized(A) {
  const norm = math.norm(A);
  return math.divide(A, norm);
}

function udGeoZone_TransformMatrix(matrix, sourceEPSG, destEPSG) {
  if (sourceEPSG == destEPSG) return matrix;

  const result = extractTransformComponents(matrix);
  const { translation, scale, rotation } = result;

  const transform = proj4(sourceEPSG, destEPSG);

  let axis_x = getRow(matrix, 0);
  let axis_y = getRow(matrix, 1);
  let axis_z = getRow(matrix, 2);
  let axis_t = getRow(matrix, 3);

  axis_x = math.subset(axis_x, math.index(0, math.range(0, 3)));
  axis_y = math.subset(axis_y, math.index(0, math.range(0, 3)));
  axis_z = math.subset(axis_z, math.index(0, math.range(0, 3)));
  axis_t = math.subset(axis_t, math.index(0, math.range(0, 3)));

  axis_x = axis_x.toArray()[0];
  axis_y = axis_y.toArray()[0];
  axis_z = axis_z.toArray()[0];
  axis_t = axis_t.toArray()[0];

  let normalizedX = normalized(axis_x);
  let normalizedY = normalized(axis_y);
  let normalizedZ = normalized(axis_z);

  let llO = axis_t;
  let llX = math.add(normalizedX, llO);
  let llY = math.add(normalizedY, llO);
  let llZ = math.add(normalizedZ, llO);

  let czO = transform.forward(llO);
  let czX = transform.forward(llX);
  let czY = transform.forward(llY);
  let czZ = transform.forward(llZ);

  czX = math.subtract(czX, czO);
  czY = math.subtract(czY, czO);
  czZ = math.subtract(czZ, czO);

  czY = math.cross(czZ, czX);
  czX = math.cross(czY, czZ);

  czX = normalized(czX);
  czY = normalized(czY);
  czZ = normalized(czZ);

  czX = math.multiply(czX, scale[0]);
  czY = math.multiply(czY, scale[1]);
  czZ = math.multiply(czZ, scale[2]);

  let x_axis = [...czX, 0];
  let y_axis = [...czY, 0];
  let z_axis = [...czZ, 0];
  let t_axis = [...czO, 1];

  return [...x_axis, ...y_axis, ...z_axis, ...t_axis];
}

class UdScenePrimitive {
  vertexShaderText = `in vec2 position;
uniform mat4 u_modelMatrix;
in vec2 texcoord;
out vec2 v_st;
void main() {
  v_st = texcoord;
  gl_Position = vec4(position, 0.0, 1.0)*u_modelMatrix;
}`

  fragmentShaderText = `in vec2 v_st;
uniform sampler2D udTexture;
uniform sampler2D udDepth;
uniform vec4 czm_pickColor;
//RGBA to Float from https://github.com/ihmeuw/glsl-rgba-to-float/blob/master/index.glsl
// Denormalize 8-bit color channels to integers in the range 0 to 255.
ivec4 floatsToBytes(vec4 inputFloats, bool littleEndian) {
  ivec4 bytes = ivec4(inputFloats * 255.0);
  return (
    littleEndian
    ? bytes.abgr
    : bytes
  );
}
// Break the four bytes down into an array of 32 bits.
void bytesToBits(const in ivec4 bytes, out bool bits[32]) {
  for (int channelIndex = 0; channelIndex < 4; ++channelIndex) {
    float acc = float(bytes[channelIndex]);
    for (int indexInByte = 7; indexInByte >= 0; --indexInByte) {
      float powerOfTwo = exp2(float(indexInByte));
      bool bit = acc >= powerOfTwo;
      bits[channelIndex * 8 + (7 - indexInByte)] = bit;
      acc = mod(acc, powerOfTwo);
    }
  }
}
// Compute the exponent of the 32-bit float.
float getExponent(bool bits[32]) {
  const int startIndex = 1;
  const int bitStringLength = 8;
  const int endBeforeIndex = startIndex + bitStringLength;
  float acc = 0.0;
  int pow2 = bitStringLength - 1;
  for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {
    acc += float(bits[bitIndex]) * exp2(float(pow2--));
  }
  return acc;
}
// Compute the mantissa of the 32-bit float.
float getMantissa(bool bits[32], bool subnormal) {
  const int startIndex = 9;
  const int bitStringLength = 23;
  const int endBeforeIndex = startIndex + bitStringLength;
  // Leading/implicit/hidden bit convention:
  // If the number is not subnormal (with exponent 0), we add a leading 1 digit.
  float acc = float(!subnormal) * exp2(float(bitStringLength));
  int pow2 = bitStringLength - 1;
  for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {
    acc += float(bits[bitIndex]) * exp2(float(pow2--));
  }
  return acc;
}
// Parse the float from its 32 bits.
float bitsToFloat(bool bits[32]) {
  float signBit = float(bits[0]) * -2.0 + 1.0;
  float exponent = getExponent(bits);
  bool subnormal = abs(exponent - 0.0) < 0.01;
  float mantissa = getMantissa(bits, subnormal);
  float exponentBias = 127.0;
  return signBit * mantissa * exp2(exponent - exponentBias - 23.0);
}
// Decode a 32-bit float from the RGBA color channels of a texel.
float rgbaToFloat(vec4 texelRGBA, bool littleEndian) {
  ivec4 rgbaBytes = floatsToBytes(texelRGBA, littleEndian);
  bool bits[32];
  bytesToBits(rgbaBytes, bits);
  return bitsToFloat(bits);
}
float DecodeExp(vec4 pack ){
  int exponent = int( pack.w * 256.0 - 127.0 );
  float value  = dot( pack.xyz, 1.0 / vec3(1.0, 256.0, 256.0*256.0) );
  value = value * (2.0*256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0) - 1.0;
  return value * exp2( float(exponent) );
}
float DecodeFloatRGBA (vec4 v) {
  const vec4 bitEnc = vec4(1.0,255.0,65025.0,16581375.0);
  const vec4 bitDec = 1.0/bitEnc;
  return dot(v, bitDec);
}

void main()
{
  float far=gl_DepthRange.far;
  float near=gl_DepthRange.near;
  //gl_FragColor = texture(udTexture, v_st).bgra;
  out_FragColor = texture(udTexture, v_st).bgra;
  //float distanceF = texture(udDepth, v_st).w;
  float distanceF = rgbaToFloat(texture(udDepth, v_st), true);
  if (distanceF == 1.0)
      discard;
  vec4 clipPosition = vec4(v_st * 2.0 - 1.0, distanceF, 1.0);
  vec4 eyePosition = czm_inverseProjection * clipPosition;
  eyePosition /= eyePosition.w;
  float distanceM = length((czm_inverseView * eyePosition).xyz - czm_viewerPositionWC);
  
  
  float depthOrLogDepth = czm_unpackDepth(texture(udDepth, v_st));
  vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depthOrLogDepth);
  eyeCoordinate /= eyeCoordinate.w;
  //float depth_tw = eyeCoordinate.z / eyeCoordinate.w;

  #ifdef LOG_DEPTH
    czm_writeLogDepth((czm_projection * vec4(eyePosition.xyz, 1.0)).w + 1.0);
  #else
    gl_FragDepth = czm_eyeToWindowCoordinates(vec4(eyePosition.xyz, 1.0)).z;
  #endif
}`

  constructor() {
    this.show = true
    this._width = 500
    this._height = 500
    this._colourTextureGL = null
    this._udTextureDepth = null
    this.pickPrimitive = true
    this.id = 'UdScenePrimitive'

    this.quality = 1
    // this.modelMatrix = new Cesium.Matrix4(); // modelMatrix
    // this.modelMatrix = Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY); // modelMatrix
    this.modelMatrix = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0.0, 0.0, 0.0)
    );
    console.log('UdScenePrimitive初始化的modelMatrix', this.modelMatrix)
  }

  createCommand(frameState) {
    const context = frameState.context
    const attributeLocations = {
      position: 0,
      texcoord: 1
    }

    if (!Cesium.defined(this._pickId) || this._id !== this.id) {
      this._id = this.id
      this._pickId = this._pickId && this._pickId.destroy()
      this._pickId = context.createPickId({
        primitive: this,
        id: this.id
      })
    }
    const that = this
    const uniformMap = {
      udTexture() {
        return that._colourTextureGL
      },
      udDepth() {
        return that._udTextureDepth
      },
      u_modelMatrix() {
        return that.modelMatrix
      },
      czm_pickColor() {
        return that._pickId.color
      }
    }
    const positionBuffer = Cesium.Buffer.createVertexBuffer({
      usage: Cesium.BufferUsage.STATIC_DRAW,
      typedArray: new Float32Array([-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0]),
      context: frameState.context
    })

    const texcoordBuffer = Cesium.Buffer.createVertexBuffer({
      usage: Cesium.BufferUsage.STATIC_DRAW,
      typedArray: new Float32Array([0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1]),
      context: frameState.context
    })

    const vertexArray = new Cesium.VertexArray({
      context: frameState.context,
      attributes: [
        {
          index: 0, // 等于 attributeLocations['position']
          vertexBuffer: positionBuffer,
          componentsPerAttribute: 2,
          componentDatatype: Cesium.ComponentDatatype.FLOAT
        },
        {
          index: 1, // 等于 attributeLocations['texcoord']
          vertexBuffer: texcoordBuffer,
          componentsPerAttribute: 2,
          componentDatatype: Cesium.ComponentDatatype.FLOAT
        }
      ]
    })
    const program = Cesium.ShaderProgram.fromCache({
      context: frameState.context,
      vertexShaderSource: that.vertexShaderText,
      fragmentShaderSource: that.fragmentShaderText,
      attributeLocations: attributeLocations
    })
    const renderState = Cesium.RenderState.fromCache({
      depthTest: {
        enabled: true
      },
      stencilTest: {
        backFunction: Cesium.StencilFunction.ALWAYS,
        backOperation: {
          fail: Cesium.StencilOperation.KEEP,
          zFail: Cesium.StencilOperation.KEEP,
          zPass: Cesium.StencilOperation.REPLACE
        },
        enabled: true,
        frontFunction: Cesium.StencilFunction.ALWAYS,
        frontOperation: {
          fail: Cesium.StencilOperation.KEEP,
          zFail: Cesium.StencilOperation.KEEP,
          zPass: Cesium.StencilOperation.REPLACE
        },
        reference: Cesium.StencilConstants.CESIUM_3D_TILE_MASK
      }
    })

    // let modelMatrix = new Cesium.Matrix4(...);

    // let modelMatrix = Cesium.Matrix4.fromTranslation(
    //   new Cesium.Cartesian3(0.0, 0.0, 0.0)
    // )

    return new Cesium.DrawCommand({
      modelMatrix: that.modelMatrix,
      vertexArray: vertexArray,
      shaderProgram: program,
      uniformMap: uniformMap,
      renderState: renderState,
      // pass: Cesium.Pass.OPAQUE,
      pass: Cesium.Pass.CESIUM_3D_TILE,
      pickId: 'czm_pickColor'
    })
  }

  /**
   * @param {FrameState} frameState
   */
  update(frameState) {
    if (!this.show) return
    const context = frameState.context
    const width = context.canvas.clientWidth * this.quality
    const height = context.canvas.clientHeight * this.quality
    const firstRun = this._colourTextureGL == null

    const sizeChanged = this._width != width || this._height != height
    if (firstRun || sizeChanged) {
      if (sizeChanged) {
        this._width = width
        this._height = height
      }
      udSDKJS_ResizeScene(this._width, this._height, 0, 0)
    }

    var v = frameState.camera.viewMatrix
    udSDKJS_SetMatrix('view', v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9], v[10], v[11], v[12], v[13], v[14], v[15])

    v = frameState.camera.frustum.projectionMatrix
    udSDKJS_SetMatrix('projection', v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9], v[10], v[11], v[12], v[13], v[14], v[15])


    udSDKJS_RenderQueue()
    const ptr = udSDKJS_GetColourBuffer()
    const colorArray = new Uint8Array(HEAPU8.subarray(ptr, ptr + this._width * this._height * 4))
    const ptrToDepth = udSDKJS_GetDepthBuffer()
    const depthArray = new Uint8Array(HEAPU8.subarray(ptrToDepth, ptrToDepth + this._width * this._height * 4))
    const that = this
    if (sizeChanged) {
      if (this._colourTextureGL) {
        this._colourTextureGL.destroy()
        this._colourTextureGL = null
        this._udTextureDepth.destroy()
        this._udTextureDepth = null
      }
    }

    if (!this._colourTextureGL) {
      this._colourTextureGL = new Cesium.Texture({
        context: context,
        width: that._width,
        height: that._height,
        pixelFormat: Cesium.PixelFormat.RGBA,
        flipY: false,
        source: {
          framebuffer: context.defaultFramebuffer,
          xOffset: 0,
          yOffset: 0,
          width: that._width,
          height: that._width,
          arrayBufferView: colorArray
        }
      })

      this._udTextureDepth = new Cesium.Texture({
        context: context,
        width: that._width,
        height: that._height,
        pixelFormat: Cesium.PixelFormat.RGBA,
        flipY: false,
        source: {
          framebuffer: context.defaultFramebuffer,
          xOffset: 0,
          yOffset: 0,
          width: that._width,
          height: that._width,
          arrayBufferView: depthArray
        }
      })
    } else {
      this._colourTextureGL.copyFrom({
        source: {
          width: that._width,
          height: that._height,
          arrayBufferView: colorArray
        }
      })
      this._udTextureDepth.copyFrom({
        source: {
          width: that._width,
          height: that._height,
          arrayBufferView: depthArray
        }
      })
    }

    const command = this.createCommand(frameState)
    frameState.commandList.push(command)


  }

  destroy() {
    this._pickId = this._pickId && this._pickId.destroy()
    return Cesium.destroyObject(this)
  }
}

let thisCurrentModelRet = null
export class udCesium {
  constructor(viewer) {
    this.udSDKjs = 0 //udSDKjs脚本初始化的状态
    this.easyudSDKjs = 0 //easyudSDKjs脚本初始化的状态
    this.udSDKReady = 0 //uds模型初始化的状态
    this.viewer = viewer
    this.udScenePrimitive = null
    // this.currentModelRet = null  //临时加载的
    // this._initJS() //内部的私有函数
    this.udsLoadList = [] //存放加载过的uds列表：用来暴露给外部
    this.udsItems = [] // uds加载列表【model.url:slotId || undefind】：用来控制uds的显示与隐藏
  }

  /** 初始化脚本 */
  _initJS() {
    let _self = this
    if (document) {
      const udSDKjs = document.createElement('script')
      // udSDKjs.defer=true;
      udSDKjs.onload = function () {
        // console.log("udSDKjs 加载完成")
        _self.udSDKjs = 1
      }
      udSDKjs.src = './SDK/udSDKjs.js'
      document.body.appendChild(udSDKjs)
      const easyudSDKjs = document.createElement('script')
      easyudSDKjs.onload = function () {
        console.log('easyudSDKjs 加载完成')
        _self.easyudSDKjs = 1
      }
      easyudSDKjs.src = './SDK/easyudSDKjs.js'
      document.body.appendChild(easyudSDKjs)
    } else {
      throw new Error('请在浏览器环境下执行！')
    }
  }

  /** 判断域名是否有加载uds的权限有就不用登录了 */
  async authority() {
    let _self = this

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
    /** 内部函数 */

    console.log('开始验证权限！')
    await sleep(1000) //用了其它的很多方式
    // if (_self.udSDKjs != 1 && _self.easyudSDKjs != 1) {
    //   throw new Error('脚本未初始化完成！')
    // }

    // udSDKJS_RegisterShared()
    // udSDKJS_SetServerAddress('https://udstream.eulee.cn')
    _self.udSDKReady = 1
    let status = udSDKJS_Domain('CesiumJS')
    return new Promise((resolve, reject) => {
      if (status == 0) {
        _self.udSDKReady = 2
        resolve(status)
      } else {
        resolve(500)
      }
    }).catch((err) => {
      reject(err)
    })

    // var Module = {
    //   noExitRuntime: true,
    //   preRun: [],
    //   postRun: _udSDKPluginInit,
    //   setStatus: function (text) {
    //     if (!Module.setStatus.last)
    //       Module.setStatus.last = {
    //         time: Date.now(),
    //         text: ''
    //       }

    //     if (text === Module.setStatus.last.text) return

    //     var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/)
    //     var now = Date.now()
    //     if (m && now - Module.setStatus.last.time < 30) return // if this is a progress update, skip it if too soon

    //     Module.setStatus.last.time = now
    //     Module.setStatus.last.text = text
    //     if (m) {
    //       text = m[1]
    //     }
    //   },
    //   totalDependencies: 0,
    //   monitorRunDependencies: function (left) {
    //     this.totalDependencies = Math.max(this.totalDependencies, left)
    //     Module.setStatus(left ? 'Preparing....----... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.')
    //   }
    // }
    // return Module.postRun()
  }

  /** 登录相关的方法 */
  login(usrName, usrPwd) {
    let _self = this
    if (usrName && usrPwd) {
      if (_self.udSDKReady !== 1) {
        throw new Error('Not ready to login!')
      }
      return new Promise((resolve, reject) => {
        udSDKJS_SetServerAddress('https://udstream.eulee.cn')
        let status = udSDKJS_Login(usrName, usrPwd, 'Cesium')
        if (status == 0) {
          _self.udSDKReady = 2
          resolve(status)
        } else {
          if (status == 13) {
            reject('udSDKJS Error / Username & Password Wrong')
          } else {
            reject('udSDKJS FAILED Error=' + status)
          }
        }
      })
    } else {
      throw new Error('登录用户名与密码不能为空！')
    }
  }

  /**设置默认viewer */
  setViewer(viewer) {
    this.viewer = viewer
  }

  flytoUdsModel(handle) {
    const headerData = udSDKJS_GetHeaderData(handle)
    let extentRadius = new Cesium.Cartesian3(headerData.boundingBoxExtents[0], headerData.boundingBoxExtents[1], headerData.boundingBoxExtents[2])
    let radius = Cesium.Cartesian3.magnitude(extentRadius)
    this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(headerData.latLong[1], headerData.latLong[0], 0), radius * headerData.scaledRange))
  }

  /**  加载模型
   * 如果传入cameraPosition则会定位到cameraPosition,否则自动计算模型位置来进行定位
   */
  loadUds(udsModel, cameraPosition) {
    if (Cesium) {
      if (!this.udScenePrimitive) {
        this.udScenePrimitive = new UdScenePrimitive()
        this.viewer.scene.primitives.add(this.udScenePrimitive)
      }
      let ret = this.loadUDSModel(udsModel)
      //console.log("ret:", ret);
      ret.then((handlePair) => {
        //window.endTime = new Date().getTime();
        //document.getElementById("message").innerHTML = "耗时: " + (window.endTime - window.startTime) + " 毫秒";
        if (cameraPosition) {
          this._flyCamera(this.viewer, cameraPosition)
        } else {

          const handle = handlePair.modelHandle
          thisCurrentModelRet = handlePair.renderIndex
          this.flytoUdsModel(handle)
        }
      })
      return ret
    } else {
      throw new Error('未引入Cesium对象！')
    }
  }


  updateUdsHeight(orginHeight) {
    console.log('动态更新uds的位置！')
    this.udScenePrimitive.modelMatrix = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0.0, 0.0, orginHeight)
    );
  }

  updateUdsX(orginX) {
    console.log('动态更新uds的位置！')

    let prjMatrix4 = new Cesium.Matrix4(
      1, 0, 0, orginX,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    // this.udScenePrimitive.modelMatrix = Cesium.Matrix4.fromTranslation(
    //   new Cesium.Cartesian3(orginX, 0.0, 0.0)
    // );

    this.udScenePrimitive.modelMatrix = prjMatrix4
  }

  updateUdsY(orginY) {
    console.log('动态更新uds的位置！')
    // this.udScenePrimitive.modelMatrix = Cesium.Matrix4.fromTranslation(
    //   new Cesium.Cartesian3(0.0, orginY, 0.0)
    // );

    let prjMatrix4 = new Cesium.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, orginY,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    // 创建一个单位矩阵
    var rotationMatrix = Cesium.Matrix4.IDENTITY.clone();

    // 创建旋转矩阵并应用于单位矩阵
    var rotation = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(orginY));
    Cesium.Matrix4.multiplyByMatrix3(rotationMatrix, rotation, rotationMatrix);

    console.log('rotationMatrix--------', rotationMatrix)

    // rotationMatrix 现在是一个沿着 x 轴旋转 90 度的矩阵

    this.udScenePrimitive.modelMatrix = rotationMatrix
  }

  /** 批量加载模型   加载模型列表
   * 加载成功后会返回promise，promise的结果值是包含模型句柄的对象数组
   * 类似这样 [{ modelHandle, renderIndex}, ...]
   */
  async loadUdsList(list, cameraPosition) {
    if (Cesium) {
      let results = []
      if (!this.udScenePrimitive) {
        //viewer.scene.globe.depthTestAgainstTerrain = true;
        this.udScenePrimitive = new UdScenePrimitive()
        this.viewer.scene.primitives.add(this.udScenePrimitive)
      }
      for (let i = 0; i < list.length; i++) {
        let handlePair = await this.loadUDSModel(list[i])
        results.push(handlePair)
      }
      if (cameraPosition) {
        this._flyCamera(this.viewer, cameraPosition)
      } else {
        let handle = results[results.length - 1].modelHandle
        this.flytoUdsModel(handle)
      }
      return results
    } else {
      throw new Error('未引入Cesium对象！')
    }
  }

  /**  切换模型  从当前模型切换到另外一个模型 */
  changeUds(udsModel, cameraPosition) {
    udSDKJS_RenderQueueClear() //先清除掉
    this.udsItems = []
    this.loadUds(udsModel, cameraPosition)
  }

  /** 切换模型列表   从一个模型列表  切换成另外一个模型列表 */
  async changeUdsList(udsModelList, cameraPosition) {
    if (udsModelList.length > 0) {
      udSDKJS_RenderQueueClear() //先清除掉
      this.udsItems = []
      for (let i = 0; i < udsModelList.length; i++) {
        await this.loadUDSModel(udsModelList[i])
      }
      this._flyCamera(this.viewer, cameraPosition)
    }
  }

  /** 清除到模型 */
  clearUds() {
    udSDKJS_RenderQueueClear() //先清除掉
    this.udsLoadList = [] //清除uds加载列表
    this.udsItems = [] //清除uds控制显隐列表
  }

  _flyCamera = (viewer, location, duration) => {
    if (viewer == null) {
      console.log('Viewer is not defined!')
      return
    }

    viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(location.position[0], location.position[1], location.position[2]), 500 + location.offset / 10))
    return true
  }

  loadUDSModel = async (model) => {
    let ret = {
      modelHandle: null,
      renderIndex: null
    }
    if (model === null) return ret
    let handle1 = await udSDKJS_LoadModel(model.url)
    let handle2
    if (model.offsetPosition) {
      let headerData = udSDKJS_GetHeaderData(handle1)
      let udsHeadMatrix = headerData.storedMatrix
      let transformationMatrix = math.matrix([
        [udsHeadMatrix[0], udsHeadMatrix[1], udsHeadMatrix[2], udsHeadMatrix[3]],
        [udsHeadMatrix[4], udsHeadMatrix[5], udsHeadMatrix[6], udsHeadMatrix[7]],
        [udsHeadMatrix[8], udsHeadMatrix[9], udsHeadMatrix[10], udsHeadMatrix[11]],
        [udsHeadMatrix[12], udsHeadMatrix[13], udsHeadMatrix[14], udsHeadMatrix[15]],
      ]);


      //旋转矩阵
      let rotationMatrix = math.matrix([
        [6.123234262925839e-17, 0, -1, 0],
        [0, 1, 0, 0],
        [1, 0, 6.123234262925839e-17, 0],
        [0, 0, 0, 1],
      ]);

      let rotationMatrix2 = math.matrix([
        [6.123234262925839e-17, 0, 1, 0],
        [0, 1, 0, 0],
        [-1, 0, 6.123234262925839e-17, 0],
        [0, 0, 0, 1],
      ]);


      //平移矩阵
      let offsetMatrix = math.matrix([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [model.offsetPosition[0], model.offsetPosition[1], model.offsetPosition[2], 1],
      ]);

      // let rotateAndOffsetMatrix = math.multiply(rotationMatrix2, offsetMatrix)
      // transformationMatrix = math.multiply(transformationMatrix, rotationMatrix2)

      // transformationMatrix = math.multiply(transformationMatrix, offsetMatrix)

      transformationMatrix = math.multiply(transformationMatrix, offsetMatrix)
      let lastMatrix = udGeoZone_TransformMatrix(
        transformationMatrix,
        headerData.metadata.ProjectionID,
        "EPSG:4978"
      );

      handle2 = udSDKJS_RenderQueueAddModelWithMatrix(handle1, lastMatrix)

    } else {
      handle2 = udSDKJS_RenderQueueAddModel(handle1, model.eval[0], model.eval[1])
    }
    model.isVisible = true
    this.udsLoadList.push(model)
    this.udsItems.push({ [model.url]: handle2 })

    ret.modelHandle = handle1
    ret.renderIndex = handle2
    return ret
  }

  /**
   * @abstract  隐藏指定uds
   * @param {object} model 
   *          {
                key: 'xxxxx',
                url: 'uds链接地址',
                eval: [140, 4978]
              }
   */
  hiddenUDSModel = (model) => {
    let index = this.udsItems.findIndex((item) => {
      if (Object.keys(item)[0] == model.url) {
        return item
      }
    })
    if (index >= 0) {
      udSDKJS_RenderQueueRemoveItem(this.udsItems[index][model.url])
      this.udsItems.splice(index, 1, { [model.url]: undefined })
    } else {
      console.log('当前uds列表中没有该模型，请检查加载uds处是否成功！')
    }
  }
  /**
   * @abstract  显示指定uds
   * @param {object} model 
   *          {
                key: 'xxxxx',
                url: 'uds链接地址',
                eval: [140, 4978]
              }
   */
  showUDSModel = async (model) => {
    let index = this.udsItems.findIndex((item) => {
      if (Object.keys(item)[0] == model.url) {
        return item
      }
    })
    let handle1 = await udSDKJS_LoadModel(model.url)
    let handle2 = udSDKJS_RenderQueueAddModel(handle1, model.eval[0], model.eval[1])
    this.udsItems.splice(index, 1, { [model.url]: handle2 })
  }
  /**
   * @abstract  移动到指定uds处
   * @param {object} model 
   *          {
                key: 'xxxxx',
                url: 'uds链接地址',
                eval: [140, 4978]
              }
   */
  async moveToUds(model) {
    let handle = await udSDKJS_LoadModel(model.url)
    const headerData = udSDKJS_GetHeaderData(handle)
    let extentRadius = new Cesium.Cartesian3(headerData.boundingBoxExtents[0], headerData.boundingBoxExtents[1], headerData.boundingBoxExtents[2])
    let radius = Cesium.Cartesian3.magnitude(extentRadius)
    this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(headerData.latLong[1], headerData.latLong[0], 0), radius * headerData.scaledRange))
  }

  getUdsLoadList() {
    return this.udsLoadList
  }
}
