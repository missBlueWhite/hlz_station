import * as Cesium from "cesium";
import wallImg from './colors2.png'
let color = new Cesium.Color.fromCssColorString('rgba(0, 255, 255, 1)'),
    speed = 10,
    source =
    'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    vec4 colorImage = texture(image, vec2(fract((st.t - speed*czm_frameNumber*0.005)), st.t));\n\
    vec4 fragColor;\n\
    fragColor.rgb = color.rgb / 1.0;\n\
    fragColor = czm_gammaCorrect(fragColor);\n\
    material.alpha = colorImage.a * color.a;\n\
    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
    material.emission = fragColor.rgb;\n\
    return material;\n\
}'

export let PolylinePulseLinkMaterial = new Cesium.Material({
    fabric: {
        type: 'PolylinePulseLink',
        uniforms: {
            color: color,
            image: wallImg,
            speed: speed,
        },
        source: source,
    },
    translucent: function () {
        return true
    },
})
