import { personTrackData } from '../mockData/mockData.js'
import * as Cesium from "cesium";
//人物漫游相关的处理
export class RoamHandler {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.myCustomDataSource = new Cesium.CustomDataSource("roamListCollection"); //用来存放所有的标注点
        this.viewer.dataSources.add(this.myCustomDataSource);
        // this.roamList = []
        // this.roamPathList = []
        // this.roamPathEntityList = []
        // this.roamPathEntity = null
    }

    //开始漫游
    startRoam() {
        let viewer = this.viewer
        // 准备轨迹数据（示例数据）
        let trackData = [
            { time: Cesium.JulianDate.fromIso8601('2023-09-01T00:00:00Z'), position: Cesium.Cartesian3.fromDegrees(113.52987165698563, 22.80379039702072, 0.8444008388955215) },
            { time: Cesium.JulianDate.fromIso8601('2023-09-01T00:00:30Z'), position: Cesium.Cartesian3.fromDegrees(113.53278311615425, 22.80327611662719, -0.9615703210099369) },
            { time: Cesium.JulianDate.fromIso8601('2023-09-01T00:01:00Z'), position: Cesium.Cartesian3.fromDegrees(113.53645493499842, 22.803311483725963, 22.803311483725963) },
            { time: Cesium.JulianDate.fromIso8601('2023-09-01T00:01:30Z'), position: Cesium.Cartesian3.fromDegrees(113.54123866381809, 22.80339708183446, -0.2295875645923382) },
            { time: Cesium.JulianDate.fromIso8601('2023-09-01T00:02:00Z'), position: Cesium.Cartesian3.fromDegrees(113.54095678716851, 22.799803666956308, 0.9348839673871481) },
            { time: Cesium.JulianDate.fromIso8601('2023-09-01T00:02:30Z'), position: Cesium.Cartesian3.fromDegrees(113.54030781773946, 22.796328978719423, 9.419586548840925) },
        ];

        // 创建一个漫游动画，以平滑地移动相机
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(113.52987165698563, 22.80379039702072, 200), // 初始相机位置
            orientation: {
                heading: Cesium.Math.toRadians(0), // 初始方向（北向）
                pitch: Cesium.Math.toRadians(-90), // 初始俯仰角（向下看）
                roll: 0 // 初始滚动角
            },
            duration: 1, // 漫游持续时间（秒）
            complete: function () {
                // 漫游完成后的回调函数
                // 在这里可以执行其他操作
            }
        });



        let entity = this.createRoamStaffPoint([113.52987165698563, 22.80379039702072, 0.8444008388955215], 'xxxxxx', [1.0, 0.7529, 0.0, 0.7])
        this.createRoamPath(personTrackData)

        // 设置时钟属性
        let clock = viewer.clock;
        clock.startTime = Cesium.JulianDate.fromIso8601('2023-09-01T00:00:00Z');
        clock.stopTime = Cesium.JulianDate.fromIso8601('2023-09-01T00:02:30Z');
        clock.currentTime = Cesium.JulianDate.fromIso8601('2023-09-01T00:00:00Z');
        clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 设置时钟循环模式
        // 创建路径属性
        let positionProperty = new Cesium.SampledPositionProperty();
        trackData.forEach(function (data) {
            positionProperty.addSample(data.time, data.position);
        });

        // 将路径与实体关联
        entity.position = positionProperty;

        // 播放轨迹
        // viewer.clock = clock;
        viewer.clock.shouldAnimate = true; // 开始播放轨迹
    }

    //暂停漫游
    pauseRoam() {
        this.viewer.clock.shouldAnimate = false; // 暂停播放轨迹
    }

    //继续漫游
    continueRoam() {
        this.viewer.clock.shouldAnimate = true; // 暂停播放轨迹
    }

    //结束漫游
    stopRoam() {
        //将人物回到初始化位置
        this.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2023-09-01T00:00:00Z');  //这个时间需要和初始化的时间一致
        this.viewer.clock.shouldAnimate = false; // 暂停播放轨迹
    }

    //清除漫游
    clearRoam() {
        //清除漫游点位
        let roamDataSources = this.viewer.dataSources.getByName('roamListCollection')[0]
        if(!roamDataSources) return
        roamDataSources.entities.removeAll()

    }

    createRoamStaffPoint(point, personName, textBg) {
        // 先画线后画点，防止线压盖点
        // let linePositions = [];
        // linePositions.push(new Cesium.Cartesian3.fromDegrees(point[0], point[1], 0));
        // linePositions.push(new Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]));
        let entity = this.myCustomDataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]),
            // 图标
            id: 'ramStaffId',
            type: 'roamStaff',
            // billboard: {
            //     image: mapIcon,
            //     // width: 36,  //50  60
            //     // height: 126,
            //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            //     horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // //相对于对象的原点（注意是原点的位置）的水平位置
            //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            // },
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED
            },
            label: {
                //文字标签
                text: personName,
                font: '12px sans-serif',
                style: Cesium.LabelStyle.FILL,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(-30, -10),
                showBackground: true,
                // backgroundColor: new Cesium.Color.fromBytes(106, 109, 110),
                backgroundColor: new Cesium.Color(textBg[0], textBg[1], textBg[2], textBg[3]),
                // disableDepthTestDistance: Number.POSITIVE_INFINITY
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200)
            },
            // polyline: {
            //     positions: linePositions,
            //     width: 1,
            //     // material: lineMaterial
            // }
        });

        return entity

    }

    //创建线路
    createRoamPath(points) {
        if (points && points.length < 2) {
            return
        }


        let resPoints = []
        for (let i = 0; i < points.length - 1; i++) {
            resPoints.push(
                Cesium.Cartesian3.fromDegrees(points[i]['point'][0], points[i]['point'][1], points[i]['point'][2]),
            )
        }
        // 定义一组点（经度、纬度、高度）
        // let  points = [
        //     Cesium.Cartesian3.fromDegrees(-75.0, 40.0, 0),
        //     Cesium.Cartesian3.fromDegrees(-76.0, 40.0, 0),
        //     Cesium.Cartesian3.fromDegrees(-76.0, 41.0, 0),
        //     Cesium.Cartesian3.fromDegrees(-75.0, 41.0, 0)
        // ];

        // 创建线段
        this.myCustomDataSource.entities.add({
            polyline: {
                id: 'ramPathId',
                positions: resPoints,
                width: 2, // 线段宽度
                material: Cesium.Color.GREEN // 线段颜色
            }
        });
    }
}