function parseGeometry(osgGeometry) {

    var positions = new Float32Array(osgGeometry.VertexArray.flat());
    var uvs = new Float32Array(osgGeometry.TexCoordArray[0].flat());

    var primitiveSet = osgGeometry.PrimitiveSetList[0]
    var indices = primitiveSet.data;
    if (primitiveSet.value == 7) {

        let newIndices = [];
        for (let i = 0; i < indices.length; i += 4) {
            let i0 = indices[i],
                i1 = indices[i + 1],
                i2 = indices[i + 2],
                i3 = indices[i + 3];
            newIndices.push(i0, i1, i3, i1, i2, i3);
        }
        indices = newIndices;

    }

    if (indices) {

        var max = Math.max.apply(null, indices)
        if (max > 65535) {
            indices = new Uint32Array(indices)
        } else {
            indices = new Uint16Array(indices)
        }

    }

    var geometry = new Cesium.Geometry({
        attributes: {
            position: {
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: positions
            },
            st: {
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: uvs
            }
        },
        indices: indices
    })

    return geometry
}

function parseTexture(osgStateSet, context) {
    var osgImage = osgStateSet.TextureAttributeList[0].value.StateAttribute.Image

    var fileName = osgImage.Name;
    const isJPEG = fileName.search(/\.jpe?g($|\?)/i) > 0
    const isPNG = fileName.search(/\.png($|\?)/i) > 0
    if (!isPNG && !isJPEG) return;

    var mimeType = isPNG ? 'image/png' : 'image/jpeg';
    var imageUri = new Blob([osgImage.Data], {
        type: mimeType
    });
    imageUri = URL.createObjectURL(imageUri)

    return Cesium.Resource.fetchImage(imageUri).then(img => {
        var texture = new Cesium.Texture({
            context: context,
            source: img,
            width: img.width,
            height: img.height
        });
        return texture
    });
}

export default class {

    constructor(modelMatrix, osgGeometry) {

        this.modelMatrix = modelMatrix || Cesium.Matrix4.IDENTITY.clone()
        this.drawCommand = null;
        this.osgGeometry = osgGeometry

    }

    createCommand(context) {

        var modelMatrix = this.modelMatrix;

        //转换几何体
        var geometry = parseGeometry(this.osgGeometry)

        var attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(geometry)

        var va = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributeLocations: attributeLocations
        });

        var vs = `
        attribute vec3 position;
        attribute vec2 st;
        varying vec2 v_st;
        void main(){
            v_st=st;
            gl_Position = czm_projection  * czm_modelView * vec4( position , 1. );
        }
        `;
        var fs = `
        uniform sampler2D map; 
        varying vec2 v_st;
        void main(){
            gl_FragColor=texture2D( map , v_st);
        }
        `;
        var shaderProgram = Cesium.ShaderProgram.fromCache({
            context: context,
            vertexShaderSource: vs,
            fragmentShaderSource: fs,
            attributeLocations: attributeLocations
        })

        //处理纹理贴图，先生成一个默认的空白贴图，等模型纹理贴图转换完成，再替换掉
        var map = new Cesium.Texture({
            context: context,
            width: 2,
            height: 2
        })
        parseTexture(this.osgGeometry.StateSet, context).then(texture => {
            //释放默认纹理贴图
            map.destroy();
            //使用转换好的模型纹理贴图
            map = texture;
        })

        var uniformMap = {
            map() {
                return map
            }
        }

        var renderState = Cesium.RenderState.fromCache({
            cull: {
                enabled: true,
                face: Cesium.CullFace.BACK
            },
            depthTest: {
                enabled: true
            }
        })

        this.drawCommand = new Cesium.DrawCommand({
            modelMatrix: modelMatrix,
            vertexArray: va,
            shaderProgram: shaderProgram,
            uniformMap: uniformMap,
            renderState: renderState,
            pass: Cesium.Pass.OPAQUE
        })
    }

    /**
     * 
     * @param {Cesium.FrameState} frameState 
     */
    update(frameState) {
        if (!this.drawCommand) {
            this.createCommand(frameState.context)
        }
        frameState.commandList.push(this.drawCommand)
    }

}