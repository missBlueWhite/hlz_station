
import * as Cesium from "cesium";
import wallImg from './colors.png'
/* 动态墙材质 color 颜色 duration 持续时间 毫秒 trailImage 贴图地址 */
export function DynamicWallMaterialProperty(options) {

    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Color.BLUE;
    this.duration = options.duration || 1000;
    this.trailImage = wallImg // options.trailImage;
    this._time = (new Date()).getTime();
    this.viewer = options.viewer
}

/** * 带方向的墙体 * @param {*} options.get:true/false * @param {*} options.count:数量 * @param {*} options.freely:vertical/standard * @param {*} options.direction:+/- */
function _getDirectionWallShader(options) {

    if (options && options.get) {

        var materail = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\ {\n\ czm_material material = czm_getDefaultMaterial(materialInput);\n\ vec2 st = materialInput.st;";
        if (options.freely == "vertical") {
            //（由下到上）
            materail += "vec4 colorImage = texture(image, vec2(fract(st.s), fract(float(" + options.count + ")*st.t" + options.direction + " time)));\n\ ";
        } else {
            //（逆时针）
            materail += "vec4 colorImage = texture(image, vec2(fract(float(" + options.count + ")*st.s " + options.direction + " time), fract(st.t)));\n\ ";
        }
        //泛光
        materail += "vec4 fragColor;\n\ fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\ fragColor = czm_gammaCorrect(fragColor);\n\ material.diffuse = colorImage.rgb;\n\ material.alpha = colorImage.a;\n\ material.emission = fragColor.rgb;\n\ return material;\n\ }";
        return materail
    }
}

Object.defineProperties(DynamicWallMaterialProperty.prototype, {

    isConstant: {

        get: function () {

            return false;
        }
    },
    definitionChanged: {

        get: function () {

            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

var MaterialType = 'wallType' + parseInt(Math.random() * 1000);
DynamicWallMaterialProperty.prototype.getType = function (time) {

    return MaterialType;
};

DynamicWallMaterialProperty.prototype.getValue = function (time, result) {

    if (!Cesium.defined(result)) {

        result = {
        };
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = this.trailImage;
    if (this.duration) {
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    }
    this.viewer.scene.requestRender();
    return result;
};

DynamicWallMaterialProperty.prototype.equals = function (other) {

    return this === other ||
        (other instanceof DynamicWallMaterialProperty
            && Cesium.Property.equals(this._color, other._color))
};

Cesium.Material._materialCache.addMaterial(MaterialType, {

    fabric: {

        type: MaterialType,
        uniforms: {

            color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
            image: Cesium.Material.DefaultImageId,
            time: -20
        },
        source: _getDirectionWallShader({

            get: true,
            count: 10,//动态展示的条数 3是指3个光波 数字越高越密
            freely: 'vertical', //{‘vertical’和'standard' 前者表示上下 后者表示左右 需要与png搭配使用}
            direction: '-'
        }),
        // source:`
        // czm_material czm_getMaterial(czm_materialInput materialInput)
        // {czm_material material = czm_getDefaultMaterial(materialInput);
        //  vec2 st = materialInput.st;
        //  "vec4 colorImage = texture(image, vec2(fract(st.s), fract(float(" + options.count + ")*st.t" + options.direction + " time)));\n\ "
        //  "vec4 fragColor;\n\ fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\ fragColor = czm_gammaCorrect(fragColor);\n\ material.diffuse = colorImage.rgb;\n\ material.alpha = colorImage.a;\n\ material.emission = fragColor.rgb;\n\ return material;\n\ }"
        // `
    },
    translucent: function (material) {
        return true;
    }
});
