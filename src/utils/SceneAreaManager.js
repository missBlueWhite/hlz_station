import { sceneList } from '../mockData/mockData.js'
import { DynamicWallMaterialProperty } from './dynamicWallMaterialProperty.js'
import centerPointPng from '../assets/mapIcon/centerPoint.png'
import * as Cesium from "cesium";
//场景的管理
export class SceneAreaManager {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.myCustomAreaDataSource = new Cesium.CustomDataSource('areaCollection'); //用来存放所有的标注点
        this.viewer.dataSources.add(this.myCustomAreaDataSource);
        this.initAreaRange()
        this.initAreaCenter()
    }

    initMapAreaInsiteListen() {
        // 创建一个相机移动完成事件处理函数
        let self = this
        function onCameraMoveEnd() {
            // 在这里执行你的操作
            console.log('相机移动完成');
            let mapLevel = self.getZoomLevel()
            console.log('mapLevel', mapLevel)
            if (mapLevel < 15) {
                // todo=>在此处进行场景的切换   展示全局的场景面板数据
                console.log('全局的场景展示......')
            } else {
                let centerPoint = self.getCenterScreenPoint()
                console.log('centerPoint', centerPoint)
                if (!centerPoint || centerPoint.length === 0) return;
                for (let m = 0; m < sceneList.length; m++) {
                    let isInside = self.isCenterInRegion(centerPoint, sceneList[m].region)
                    console.log('isInside-----', isInside)
                    if (isInside) {
                        // todo=>在此处进行场景的切换    根据场景的id 展示对饮场景的数据
                        console.log('sceneList[m].id-----', sceneList[m].id)
                        console.log('sceneList[m].name-----', sceneList[m].name)
                    }
                }
            }
        }
        // 监听相机移动完成事件
        this.viewer.camera.moveEnd.addEventListener(onCameraMoveEnd);
    }

    //获取地图的中心屏幕坐标
    getCenterScreenPoint() {
        let screenPoint = []
        let viewer = this.viewer
        // 获取地图中心点的屏幕坐标
        let centerX = viewer.canvas.clientWidth / 2;
        let centerY = viewer.canvas.clientHeight / 2;
        // 获取地图中心点的世界坐标
        let centerWorldPosition = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(centerX, centerY));
        if (Cesium.defined(centerWorldPosition)) {
            // 计算中心点的地理坐标
            let centerCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(centerWorldPosition);
            // 获取中心点的经度和纬度
            let centerLongitude = Cesium.Math.toDegrees(centerCartographic.longitude);
            let centerLatitude = Cesium.Math.toDegrees(centerCartographic.latitude);
            // 输出中心点坐标
            screenPoint = [centerLongitude, centerLatitude]
        }

        return screenPoint
    }

    //获取地图的缩放层级
    getZoomLevel() {
        // 获取相机高度
        let cameraHeight = this.viewer.camera.positionCartographic.height;
        // 计算缩放级别
        let zoomLevel = 0;
        // 根据相机高度估算缩放级别
        if (cameraHeight >= 40075016.686) {
            zoomLevel = 0; // 世界地图级别
        } else {
            zoomLevel = Math.floor(
                Cesium.Math.log2(40075016.686 / (cameraHeight / 2)) // 计算级别
            );
        }
        return zoomLevel
    }


    //判断中心坐标是否在某个坐标范围内
    isCenterInRegion(point, polygon) {
        let x = point[0];
        let y = point[1];
        let inside = false;
        if (!polygon || polygon.length < 7) return inside;
        for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
            let xi = polygon[i];
            let yi = polygon[i + 1];
            let xj = polygon[j];
            let yj = polygon[j + 1];
            let intersect = ((yi > y) != (yj > y)) &&
                (x < ((xj - xi) * (y - yi) / (yj - yi) + xi));

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }

    //初始化区域的范围
    initAreaRange() {
        // 绘制墙体
        for (let i = 0; i < sceneList.length; i++) {
            let positions = Cesium.Cartesian3.fromDegreesArray(sceneList[i].region);
            this.viewer.entities.add({
                name: "wall" + i,
                wall: {
                    positions: positions,
                    // 设置高度
                    maximumHeights: new Array(positions.length).fill(30),
                    minimumHeights: new Array(positions.length).fill(0),
                    material: new DynamicWallMaterialProperty({
                        color: Cesium.Color.fromBytes(55, 96, 56).withAlpha(0.7),
                        duration: 3000,
                        viewer: this.viewer
                    }),
                }
            })
        }
    }

    //初始化区域的中心点
    initAreaCenter() {
        for (let i = 0; i < sceneList.length; i++) {
            let centerPoint = sceneList[i].center
            // 定义圆的参数
            let center = Cesium.Cartesian3.fromDegrees(centerPoint[0], centerPoint[1]); // 圆心的地理坐标
            let semiMajorAxis = 3.0; // 圆的半长轴（单位：米）
            let semiMinorAxis = 3.0; // 圆的半短轴（单位：米）
            let rotation = Cesium.Math.toRadians(45.0); // 圆的旋转角度
            let granularity = Cesium.Math.toRadians(1.0); // 圆的细节程度

            // 创建圆的几何对象
            let circleGeometry = new Cesium.EllipseGeometry({
                center: center,
                semiMajorAxis: semiMajorAxis,
                semiMinorAxis: semiMinorAxis,
                rotation: rotation,
                granularity: granularity,
                height: 0.0 // 圆的高度（设置为0表示贴地）
            });

            // 创建圆的几何实例
            let circleInstance = new Cesium.GeometryInstance({
                geometry: circleGeometry,
                id: 'circle',
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED) // 圆的颜色
                }
            });

            // 创建贴地的圆Primitive
            let circlePrimitive = new Cesium.GroundPrimitive({
                geometryInstances: circleInstance
            });

            // 添加圆Primitive到场景
            this.viewer.scene.primitives.add(circlePrimitive);

            //添加点位的图标
            this.viewer.entities.add({
                name: "areaCenterPoint" + i,
                position: Cesium.Cartesian3.fromDegrees(centerPoint[0], centerPoint[1], 0),
                billboard: {
                    image: centerPointPng,
                    width: 36,  //50  60
                    height: 126,
                },
                label: {
                    //文字标签
                    text: sceneList[i].name,
                    font: '12px sans-serif',
                    style: Cesium.LabelStyle.FILL,
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(-30, -80),
                    showBackground: true,
                    // backgroundColor: new Cesium.Color.fromBytes(106, 109, 110),
                    backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
                    // disableDepthTestDistance: Number.POSITIVE_INFINITY
                    // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200)
                },
            });
        }
    }
}