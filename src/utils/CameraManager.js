//相机的管理
import * as Cesium from "cesium";
//静态资源文件   图片的样式
import cameraQJ_Off from "../assets/mapIcon/qj_off.png";  //球机离线
import cameraQJ_On from "../assets/mapIcon/qj_on.png";    //球机在线
import cameraQQJ_Off from "../assets/mapIcon/qqj_off.png";  //枪机离线
import cameraQQJ_On from "../assets/mapIcon/qqj_off.png";  //枪机在线


export class CameraManager {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.myCustomDataSource = new Cesium.CustomDataSource("camareListCollection"); //用来存放所有的标注点
        this.viewer.dataSources.add(this.myCustomDataSource);
        this.cameraList = []
    }

    initCameraList(listData) {
        if (!listData || listData.length === 0) return;

        this.cameraList = listData
        //进行相机的初始化
        for (let i = 0; i < listData.length; i++) {
            this.addCamera(listData[i])
            // if (listData[i].devType == '球机' && listData[i].onLine) {
            //     this.addCamera(listData[i], cameraQJ_On)
            // } else if (listData[i].devType == '球机' && !listData[i].onLine) {
            //     this.addCamera(listData[i], cameraQJ_Off)
            // } else if (listData[i].devType == '枪机' && listData[i].onLine) {
            //     this.addCamera(listData[i], cameraQQJ_On)
            // } else if (listData[i].devType == '枪机' && !listData[i].onLine) {
            //     this.addCamera(listData[i], cameraQQJ_Off)
            // }
        }
    }

    updataCameraList(listData) {
        if (!listData || listData.length === 0) return;
        //进行相机的更新
    }

    updateSingleCamera(cameraData) {
        if (!cameraData) return;
        //进行单个相机的更新
    }

    deleteCameraList(listData) {
        if (!listData || listData.length === 0) return;
        //进行相机的删除
    }

    deleteCamera(cameraId) {
        if (!cameraId) return;
        //进行单个相机的删除
    }

    //新增单个相机点位
    addCamera(cameraData, isShow = true) {
        if (!cameraData) return;
        //判断被加载的摄像机的类型
        let cameraTypeImg;
        if (cameraData.devType == '球机' && cameraData.onLine) {
            cameraTypeImg = cameraQJ_On
        } else if (cameraData.devType == '球机' && !cameraData.onLine) {
            cameraTypeImg = cameraQJ_Off
        } else if (cameraData.devType == '枪机' && cameraData.onLine) {
            cameraTypeImg = cameraQQJ_On
        } else if (cameraData.devType == '枪机' && !cameraData.onLine) {
            cameraTypeImg = cameraQQJ_Off
        }
        //进行单个相机的添加
        let id = cameraData.id;
        let long = cameraData.point[0]
        let lat = cameraData.point[1]
        let height = cameraData.point[2] * 10
        let theTxt = cameraData.name
        // 先画线后画点，防止线压盖点
        let linePositions = [];
        linePositions.push(new Cesium.Cartesian3.fromDegrees(long, lat, 0));
        linePositions.push(new Cesium.Cartesian3.fromDegrees(long, lat, height));
        this.myCustomDataSource.entities.add({
            show: isShow,
            id: id,
            position: Cesium.Cartesian3.fromDegrees(long, lat, height),
            // 图标
            type: 'camera',
            billboard: {
                image: cameraTypeImg,
                width: 36,  //50  60
                height: 126,
            },
            label: {
                //文字标签
                text: theTxt,
                font: '14px sans-serif',
                style: Cesium.LabelStyle.FILL,
                // heightReference: Cesium.HeightReference.NONE,
                // 对齐方式(水平和竖直)
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(-30, -80),
                showBackground: true,
                // backgroundColor: new Cesium.Color.fromBytes(106, 109, 110),
                backgroundColor: new Cesium.Color(0.38039, 0.364705, 0.388235, 0.5),
                // disableDepthTestDistance: Number.POSITIVE_INFINITY
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200)
            },
            polyline: {
                positions: linePositions,
                width: 1,
                // material: lineMaterial
            }
        });


    }

    //点击某个相机点位
    clickTheCamera(cameraId, cb) {
        if (!cameraId) return;
        //进行单个相机的点击进行弹窗操作
        cb()
    }

}