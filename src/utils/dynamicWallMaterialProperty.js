import * as Cesium from "cesium";
import wallImg from './colors1.png'
//动态墙材质
export function DynamicWallMaterialProperty(options) {
    // 默认参数设置
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color;
    this.duration = options.duration;
    this.trailImage = options.trailImage;
    this._time = (new Date()).getTime();
    this.viewer = options.viewer
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

DynamicWallMaterialProperty.prototype.getType = function (time) {
    return 'DynamicWall';
};

DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    if (this.trailImage) {
        result.image = this.trailImage;
    } else {
        result.image = wallImg
    }

    if (this.duration) {
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    }
    this.viewer.scene.requestRender();
    return result;
};

DynamicWallMaterialProperty.prototype.equals = function (other) {
    return this === other ||
        (other instanceof DynamicWallMaterialProperty &&
            Cesium.Property.equals(this._color, other._color))
};


Cesium.Material._materialCache.addMaterial('DynamicWall', {
    fabric: {
        type: 'DynamicWall',
        uniforms: {
            color: new Cesium.Color(1.0, 1.0, 1.0, 1),
            image: wallImg,
            time: 0,
            speed: 8
        },
        // source: `
        // czm_material czm_getMaterial(czm_materialInput materialInput)
        // {
        // czm_material material = czm_getDefaultMaterial(materialInput);
        // vec2 st = materialInput.st;
        // vec4 colorImage = texture(image, vec2(fract(st.t - time), st.t));
        // vec4 fragColor;
        // fragColor.rgb = color.rgb / 1.0;
        // fragColor = czm_gammaCorrect(fragColor);
        // material.alpha = colorImage.a * color.a;
        // material.diffuse = color.rgb;
        // material.emission = fragColor.rgb;
        // return material;
        // }`

        source: `czm_material czm_getMaterial(czm_materialInput materialInput)
        {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            vec4 colorImage = texture(image, vec2(fract((st.t - speed*czm_frameNumber*0.005)), st.t));
            vec4 fragColor;
            fragColor.rgb = color.rgb / 1.0;
            fragColor = czm_gammaCorrect(fragColor);
            material.alpha = colorImage.a * color.a;
            material.diffuse = (colorImage.rgb+color.rgb)/2.0;
            material.emission = fragColor.rgb;
            return material;
        }`

    },
    translucent: function (material) {
        return true;
    }
});
