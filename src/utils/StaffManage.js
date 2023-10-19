//人员管理
//相机的管理
import * as Cesium from "cesium";
//静态资源文件   图片的样式  //=>todo 此处的静态资源图片  到时候根据设计换掉
import ajbjdr from "../assets/staffIcon/ajbjdr.png";  //安监部监督人
import dgdw from "../assets/staffIcon/dgdw.png";    //省级到岗
import dsdg from "../assets/staffIcon/dsdg.png"; //地市到岗
import gzbcy from "../assets/staffIcon/gzbcy.png";  //工作班成员
import gzfzr from "../assets/staffIcon/gzfzr.png";  //工作负责人
import sbbjdr from "../assets/staffIcon/sbbjdr.png";  //设备部监督人
import xjdg from "../assets/staffIcon/xjdg.png";  //县级到岗
import yjbjdr from "../assets/staffIcon/yjbjdr.png";  //运检部监督人
export class StaffManage {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.myCustomDataSource = new Cesium.CustomDataSource("staffListCollection"); //用来存放所有的标注点
        this.myCustomLabelDataSource = new Cesium.CustomDataSource('staffListLabelCollection'); //用来存放所有标注点的详细信息
        this.myCustomLineDataSource = new Cesium.CustomDataSource('staffListLineCollection'); //用来存放所有标注点的连线
        this.modelPrimitiveCollection = new Cesium.PrimitiveCollection();  //用来存放模型的primitive
        this.viewer.dataSources.add(this.myCustomDataSource);
        this.viewer.dataSources.add(this.myCustomLabelDataSource);
        this.viewer.dataSources.add(this.myCustomLineDataSource);
        this.viewer.scene.primitives.add(this.modelPrimitiveCollection);  // Add collection
        this.myCustomLabelDataSource.show = false

        this.preStaffList = []   //上一次的人员的位置信息
        this.nextStaffList = []  //下一次的人员的位置信息

    }

    initStaffList(listData) {
        if (!listData || listData.length === 0) return;
        //进行人员的初始化
        for (let i = 0; i < listData.length; i++) {
            //记录上一次的人员的位置信息
            this.preStaffList.push({
                relationWorkPlanid: listData[i].relationWorkPlanid,
                point: listData[i].point,
                centerPoint: listData[i].centerPoint
            })

            //增加
            if (listData[i].type == 'Addupdate') {
                this.addStaff(listData[i])  //加载人员点位 标注  连线等等
            } else if (listData[i].type == 'Del') {
                //删除
                this.deleteStaff(listData[i].id)
            }
        }

    }


    updataStaffList(listData) {
        if (!listData || listData.length === 0) return;
        // 进行人员的更新
        let findListInstance = this.viewer.dataSources.getByName('staffListCollection')[0].entities
        let findListLabelInstance = this.viewer.dataSources.getByName('staffListLabelCollection')[0].entities
        // 将人员之前的位置与需要更新的进行插值
        // let startTime = Cesium.JulianDate.fromDate(new Date());
        for (let i = 0; i < listData.length; i++) {
            let findPreStaff = this.preStaffList.find(item => item.relationWorkPlanid == listData[i].relationWorkPlanid)
            let findInstance = findListInstance.getById(listData[i].relationWorkPlanid)
            let findLabelInstance = findListLabelInstance.getById(listData[i].relationWorkPlanid + 'lable')
            if (findPreStaff && findInstance && findLabelInstance) {
                this._updataStaffPositonWithPositionProperty(listData[i], findInstance, findLabelInstance)
            }
        }

        this.viewer.clock.shouldAnimate = true;
        // this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

        // 
        // this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;  // 时间结束了，再继续重复来一遍

        //位置更新完之后  重新更新this.preStaffList的数据
        // for (let k = 0; k < listData.length; k++) {
        //     this.preStaffList.push({
        //         relationWorkPlanid: listData[k].relationWorkPlanid,
        //         point: listData[k].point,
        //         centerPoint: listData[k].centerPoint
        //     })
        // }

        // // 进行人员的更新
        // let findListInstance = this.viewer.dataSources.getByName('staffListCollection')[0].entities
        // let findListLabelInstance = this.viewer.dataSources.getByName('staffListLabelCollection')[0].entities
        // let findListLineInstance = this.viewer.dataSources.getByName('staffListLineCollection')[0].entities
        // for (let i = 0; i < listData.length; i++) {
        //     let findInstance = findListInstance.getById(listData[i].relationWorkPlanid)
        //     let findLabelInstance = findListLabelInstance.getById(listData[i].relationWorkPlanid + 'lable')
        //     let findLineInstance = findListLineInstance.getById(listData[i].relationWorkPlanid + 'line')
        //     if (findInstance && findLabelInstance && findLineInstance) {
        //         this._updateSingleStaffEntity(findInstance, findLabelInstance, findLineInstance, listData[i])
        //     }
        // }
    }


    //用回调函数更新位置
    async _updataStaffPositonWithCallback(oldInfo, newInfo, entity, entityLabel) {
        let positionsOld = Cesium.Cartesian3.fromDegrees(oldInfo.point[0], oldInfo.point[1], oldInfo.point[2]);
        let positionsNew = Cesium.Cartesian3.fromDegrees(newInfo.point[0], newInfo.point[1], newInfo.point[2]);
        let numberOfSamples = 200;
        for (let i = 0; i <= numberOfSamples; ++i) {
            await sleep(16.66)
            const factor = i / numberOfSamples;
            const locationFactor = Math.pow(factor, 2);
            const location = Cesium.Cartesian3.lerp(
                positionsOld,  //传递的上一个坐标
                positionsNew,  //传递的下一个坐标
                locationFactor,
                new Cesium.Cartesian3()
            );
            let newPositions = new Cesium.CallbackProperty(function () {
                return location
            }, false);

            entity._position = newPositions
            entityLabel._position = newPositions
        }

    }

    // //用SampledPositionProperty更新位置  目前感觉这个方式是最优的
    // _updataStaffPositonWithPositionProperty(start, oldInfo, newInfo, entity, entityLabel) {
    //     let positionsOld = Cesium.Cartesian3.fromDegrees(oldInfo.point[0], oldInfo.point[1], oldInfo.point[2]);
    //     let positionsNew = Cesium.Cartesian3.fromDegrees(newInfo.point[0], newInfo.point[1], newInfo.point[2]);
    //     let numberOfSamples = 400;
    //     let totalSeconds = 2;  //动画时间执行完毕
    //     let positionsProperty = new Cesium.SampledPositionProperty();
    //     for (let i = 0; i <= numberOfSamples; ++i) {
    //         const factor = i / numberOfSamples;
    //         const time = Cesium.JulianDate.addSeconds(
    //             start,
    //             factor * totalSeconds,
    //             new Cesium.JulianDate()
    //         );
    //         const locationFactor = Math.pow(factor, 2);
    //         const location = Cesium.Cartesian3.lerp(
    //             positionsOld,  //传递的上一个坐标
    //             positionsNew,  //传递的下一个坐标
    //             locationFactor,
    //             new Cesium.Cartesian3()
    //         );
    //         positionsProperty.addSample(time, location);
    //     }
    //     entity.position = positionsProperty;          //最后更新entity实体的坐标位置
    //     entity.orientation = new Cesium.VelocityOrientationProperty(positionsProperty)
    //     entityLabel.position = positionsProperty;     //更新标注的位置
    // }

    _updataStaffPositonWithPositionProperty(staffData, entity, entityLabel) {
        if(entity.position instanceof Cesium.SampledPositionProperty){
            console.log('cccccccccccc')
            // debugger
            // entity.position.addSample()
            entity.position.addSamples(staffData.times,staffData.positions)
        }else{
            console.log('vvvvvvvvvvvvvvvvvv')
            entity.position = staffData.point;          //最后更新entity实体的坐标位置
            entity.orientation = new Cesium.VelocityOrientationProperty(staffData.point)
            entityLabel.position = staffData.point;     //更新标注的位置
        }
    }


    iii(oldInfo, newInfo) {
        let startTime = Cesium.JulianDate.fromDate(new Date());
        const getPosition = (startP, endP, duration) => {
            return new Promise((resolve) => {
                let arr = []
                duration = duration * 1000
                for (let i = 0; i <= duration; i = i++) {
                    let pos = Cesium.Cartesian3.lerp(startP, endP, i / duration, new Cesium.Cartesian3());
                    const time = Cesium.JulianDate.addSeconds(
                        startTime,
                        duration,
                        new Cesium.JulianDate()
                    );
                    arr.push(pos)
                }
                // if (duration % forNum !== 0) {
                //     arr.push(endP)
                // }
                resolve(arr);
            })
        }


        const po1 = Cesium.Cartesian3.fromDegrees(oldInfo.point[0], oldInfo.point[1], oldInfo.point[2])
        const po2 = Cesium.Cartesian3.fromDegrees(newInfo.point[0], newInfo.point[1], newInfo.point[2])
        getPosition(po1, po2, 2).then((res) => {
            // showPath = showPath.concat(res)
            // pathIndex++
            // maxIndex = showPath.length
            const location = Cesium.Cartesian3.lerp(
                positionsOld,  //传递的上一个坐标
                positionsNew,  //传递的下一个坐标
                locationFactor,
                new Cesium.Cartesian3()
            );
        })


    }


    _updateSingleStaffEntity(findEntity, findDetailEntity, findLineEntity, staffData) {
        let lon = staffData.point[0]
        let lat = staffData.point[1]
        let height = 10 // staffData.point[2] * 1.5
        let newLinePositions = Cesium.Cartesian3.fromDegreesArrayHeights([
            lon, lat, 0,   // 新的起始点经纬度
            lon, lat, height   // 新的终点经纬度
        ]);

        if (staffData.centerPoint.length > 0) {
            let linePositions_tow = Cesium.Cartesian3.fromDegreesArrayHeights([
                lon, lat, height,   // 新的终点经纬度
                staffData.centerPoint[0], staffData.centerPoint[1], staffData.centerPoint[2]   // 新的终点经纬度
            ])
            // 更改连线的位置
            findLineEntity.polyline.positions = linePositions_tow;
        }

        // 更改竖直线的位置
        findEntity.polyline.positions = newLinePositions;
        let newPosition = Cesium.Cartesian3.fromDegrees(lon, lat, height)
        // 找到单个实体的详细信息标注
        findDetailEntity.position.setValue(newPosition);
        // 更改单个点位的位置
        findEntity.position.setValue(newPosition);
    }

    updateSingleStaff(staffData) {
        if (!staffData.relationWorkPlanid) return;
        //找到单个实体    进行单个人员的更新
        let findInstance = this.viewer.dataSources.getByName('staffListCollection')[0].entities.getById(staffData.relationWorkPlanid)  // this.myCustomDataSource.entities.getById(staffData.id)
        // let findInstance2 = this.viewer.entities.getById(staffData.id)

        if (!findInstance) return;
        let lon = staffData.point[0] + Math.random() * 0.0001
        let lat = staffData.point[1] + Math.random() * 0.0001
        let height = 10 // staffData.point[2] * 1.5

        let newLinePositions = Cesium.Cartesian3.fromDegreesArrayHeights([
            lon, lat, 0,       // 新的起始点经纬度
            lon, lat, height   // 新的终点经纬度
        ]);
        findInstance.polyline.positions = newLinePositions;
        let newPosition = Cesium.Cartesian3.fromDegrees(lon, lat, height)
        // 找到单个实体的详细信息标注
        let detailFindInstance = this.viewer.dataSources.getByName('staffListLabelCollection')[0].entities.getById(staffData.relationWorkPlanid + 'lable')
        if (detailFindInstance) {
            detailFindInstance.position.setValue(newPosition);
        }

        // 找到单个实体的连线
        let lineFindInstance = this.viewer.dataSources.getByName('staffListLineCollection')[0].entities.getById(staffData.relationWorkPlanid + 'line')
        if (lineFindInstance && staffData.centerPoint.length > 0) {
            let linePositions_tow = Cesium.Cartesian3.fromDegreesArrayHeights([
                lon, lat, height,   // 新的终点经纬度
                staffData.centerPoint[0], staffData.centerPoint[1], staffData.centerPoint[2]   // 新的终点经纬度
            ])
            lineFindInstance.polyline.positions = linePositions_tow;
        }
        // let linePositions = [];
        // linePositions.push(new Cesium.Cartesian3.fromDegrees(long, lat, 0));
        // linePositions.push(new Cesium.Cartesian3.fromDegrees(long, lat, height));
        // polyline.positions._value = linePositions
        findInstance.position.setValue(newPosition);
    }

    deleteStaffList(listData) {
        if (!listData || listData.length === 0) return;
        //进行人员的删除
    }

    deleteStaff(staffData) {
        if (!staffData) return;
        //进行单个人员的删除
        let findInstance = this.viewer.dataSources.getByName('staffListCollection')[0].entities.getById(staffData.relationWorkPlanid)
        debugger
        if (!findInstance) return
        this.viewer.dataSources.getByName('staffListCollection')[0].entities.remove(findInstance)
    }



    //新增人员点位
    addStaff(staffData, isShow = true) {
        if (!staffData) return;
        //进行单个人员的添加
        let id = staffData.relationWorkPlanid;
        let long = staffData.point[0]
        let lat = staffData.point[1]
        let height = staffData.point[2] * 0.4
        let theTxt = staffData.name  //名字
        let textBg = [0.38039, 0.364705, 0.388235, 0.5]
        if (staffData.level == '1') {
            textBg = [0.749, 0.0, 0.0, 0.7]
        } else if (staffData.level == '2') {
            textBg = [1.0, 0.0, 0.0, 0.7]
        } else if (staffData.level == '3') {
            textBg = [1.0, 0.7529, 0.0, 0.7]
        } else if (staffData.level == '4') {
            textBg = [1.0, 1.0, 0.0, 0.7]
        } else if (staffData.level == '5') {
            textBg = [0.0313, 0.6901, 0.3137, 0.7]
        }

        // 先画线后画点，防止线压盖点
        let linePositions = [];
        linePositions.push(new Cesium.Cartesian3.fromDegrees(long, lat, 0));
        linePositions.push(new Cesium.Cartesian3.fromDegrees(long, lat, height * 0.4));
        let linePositions_tow = []
        linePositions_tow.push(new Cesium.Cartesian3.fromDegrees(long, lat, staffData.point[2] * 0.3));
        if (staffData.centerPoint.length > 0) {
            linePositions_tow.push(new Cesium.Cartesian3.fromDegrees(staffData.centerPoint[0], staffData.centerPoint[1], staffData.centerPoint[2]));
            if (staffData.isAlarm) {
                this.myCustomLineDataSource.entities.add({
                    id: id + 'line',
                    polyline: {
                        positions: linePositions_tow,
                        width: 2,
                        material: Cesium.Color.fromCssColorString("rgba(255, 0, 0, 1)") // 红色,
                    }
                })
            } else {
                this.myCustomLineDataSource.entities.add({
                    id: id + 'line',
                    polyline: {
                        positions: linePositions_tow,
                        width: 2,
                        material: Cesium.Color.fromCssColorString("rgba(0, 255, 0, 1)") // 红色,
                    }
                })
            }

        }

        _drawCanvasImageName(staffData).then(res => {
            this.myCustomDataSource.entities.add({
                show: isShow,
                id: id,
                name: theTxt,
                position: Cesium.Cartesian3.fromDegrees(long, lat, height),
                type: 'staff',    // 图标
                billboard: {
                    image: res,
                    width: 125,  //50  60
                    height: 25,
                    // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // //相对于对象的原点（注意是原点的位置）的水平位置
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                },
                // label: {
                //     //文字标签
                //     text: theTxt,
                //     font: '12px sans-serif',
                //     style: Cesium.LabelStyle.FILL,
                //     // heightReference: Cesium.HeightReference.NONE,
                //     // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                //     // horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // //相对于对象的原点（注意是原点的位置）的水平位置
                //     // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                //     // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                //     // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                //     // 对齐方式(水平和竖直)
                //     horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                //     verticalOrigin: Cesium.VerticalOrigin.CENTER,
                //     pixelOffset: new Cesium.Cartesian2(-30, -10),
                //     showBackground: true,
                //     // backgroundColor: new Cesium.Color.fromBytes(106, 109, 110),
                //     backgroundColor: new Cesium.Color(textBg[0], textBg[1], textBg[2], textBg[3]),
                //     // disableDepthTestDistance: Number.POSITIVE_INFINITY
                //     // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200)
                // },
                // 竖直的线段
                // polyline: {
                //     positions: linePositions,
                //     width: 1,
                //     // material: lineMaterial
                // },

                // model: {
                //     uri: './model/Cesium_Man.glb',
                //     scale: 2.5,
                //     minimumPixelSize: 50, //最小像素大小，可以避免太小看不见
                //     clampToGround: true,
                // },
                model: {
                    uri: "./model/walk.glb",
                    scale: 5,
                    minimumPixelSize: 30, //最小像素大小，可以避免太小看不见
                    clampToGround: true,
                    // maximumScale: 20000,//模型的最大比例尺大小。minimumPixelSize的上限  
                    incrementallyLoadTextures: true,//加载模型后纹理是否可以继续流入
                    // runAnimations: true,//是否启动模型中制定的gltf动画
                    // clampAnimations: true,//制定gltf动画是否在没有关键帧的持续时间内保持最后一个姿势
                    // shadows: Cesium.ShadowMode.ENABLED,
                    // heightReference: Cesium.HeightReference.NONE
                },
            });


            // //加载人物的模型
            // // Position a model with modelMatrix and display it with a minimum size of 128 pixels
            // const headingPositionRoll = new Cesium.HeadingPitchRoll();
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
            //     "north",
            //     "west"
            // );
            // let animations;
            // try {
            //     Cesium.Model.fromGltfAsync({
            //         url: "./model/walk.glb",
            //         gltfCallback: gltf => {
            //             animations = gltf.animations

            //         },
            //         // color: Cesium.Color.RED,
            //         silhouetteColor: Cesium.Color.GREEN.withAlpha(0.9),
            //         silhouetteSize: 1,
            //         // featureIdLabel: 'name',
            //         modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
            //             Cesium.Cartesian3.fromDegrees(long, lat, height * 0.4),
            //             headingPositionRoll,
            //             Cesium.Ellipsoid.WGS84,
            //             fixedFrameTransform
            //         ),
            //         minimumPixelSize: 50,
            //     }).then((model) => {
            //         this.modelPrimitiveCollection.add(model);
            //         // animations.start.addEventListener(function (model, animation) {
            //         //     console.log(`Animation started: ${animation.name}`);
            //         // });
            //         model.readyEvent.addEventListener(() => {
            //             // model.activeAnimations.add({
            //             //     index: 0, // animations.length - 1,
            //             //     loop: Cesium.ModelAnimationLoop.REPEAT,
            //             //     multiplier: 0.5,
            //             // });
            //             // const animations = model.activeAnimations;
            //             // const length = animations.length;
            //             // for (let i = 0; i < length; ++i) {
            //             //     console.log('播放动画名称', animations.get(i).name);
            //             // }
            //             model.activeAnimations.addAll({
            //                 multiplier: 1,                            // Play at half-speed
            //                 loop: Cesium.ModelAnimationLoop.REPEAT      // Loop the animations
            //             });
            //         });
            //     })
            // } catch (error) {
            //     console.log(`Failed to load model. ${error}`);
            // }

        })

        // let theCanvasImage = theCanvas.toDataURL()
        let detailInfo = _drawCanvasImageDetailInfo(staffData)
        this.myCustomLabelDataSource.entities.add({
            show: isShow,
            id: id + 'lable',
            name: theTxt,
            position: Cesium.Cartesian3.fromDegrees(long, lat, height),
            type: 'staff_detailLabel',       // 图标
            billboard: {
                image: detailInfo,
                width: 125,  //50  60
                height: 110,
                pixelOffset: new Cesium.Cartesian2(0, -50),
                pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 1.5e7, 0.0),
                // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(100, 1.5, 300, 0),
                // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // //相对于对象的原点（注意是原点的位置）的水平位置
                // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },

            // label: {
            //     //文字标签
            //     // text: new Cesium.CallbackProperty((result) => {
            //     //     let textTipsArr = theTxt;
            //     //     if (textTipsArr.length > 10) {
            //     //         //模拟文字换行，将字符串拆成两段
            //     //         let a = textTipsArr.slice(0, 8);
            //     //         let b = textTipsArr.slice(8);
            //     //         result = a + "\n" + b
            //     //     } else {
            //     //         result = textTipsArr
            //     //     }
            //     //     return result;
            //     // }, false),
            //     text: detailInfoContent,
            //     font: '12px sans-serif',
            //     style: Cesium.LabelStyle.FILL,
            //     // 对齐方式(水平和竖直)
            //     horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            //     verticalOrigin: Cesium.VerticalOrigin.CENTER,
            //     pixelOffset: new Cesium.Cartesian2(-30, -50),
            //     showBackground: true,
            //     // backgroundColor: new Cesium.Color.fromBytes(106, 109, 110),
            //     backgroundColor: Cesium.Color.fromCssColorString(detailInfoColor),
            //     // disableDepthTestDistance: Number.POSITIVE_INFINITY
            //     // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200)
            // },
        });

        // _drawCanvasImageDetailInfo(staffData).then(res => {})
        // 用primitive的方式添加线段
        // this.primitiveCollection.add(new Cesium.Primitive({
        //     name:theTxt,
        //     id: id,
        //     geometryInstances: new Cesium.GeometryInstance({
        //         id: id,
        //         geometry: new Cesium.PolylineGeometry({
        //             positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        //                 long, lat, 0,
        //                 long, lat, height
        //             ]),
        //             width: 2.0,
        //             vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
        //             arcType: Cesium.ArcType.NONE //这里控制着画出来的是直线，而不是贴地的弧线
        //         }),
        //         attributes: {
        //             color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)
        //         }
        //     }),
        //     appearance: new Cesium.PolylineColorAppearance()
        // }));
        this._listenViewerZoom()
    }

    //监听viewer的层级，来显示详情的显示与隐藏
    _listenViewerZoom() {
        // 添加一个postRender事件来进行可见性控制
        let _viewer = this.viewer
        _viewer.scene.postRender.addEventListener(function () {
            let staffDataSources = _viewer.dataSources.getByName('staffListLabelCollection')[0]
            let cameraHeight = _viewer.camera.positionCartographic.height;
            if (staffDataSources) {
                if (cameraHeight <= 150) {  //150米的距离显示对应的数据
                    staffDataSources.show = true; // 在可见范围内显示Billboard
                } else {
                    staffDataSources.show = false; // 超出可见范围时隐藏Billboard
                }
            }
        });
    }

    //人物轨迹的漫游操作
    staffTrackRoam(staffId) {
        if (!staffId) return;
        //进行单个人员的漫游
    }

    //清空所有的人员信息
    clearAllStaff() {
        let staffDataSources = this.viewer.dataSources.getByName('staffListCollection')[0]
        if (!staffDataSources) return
        staffDataSources.entities.removeAll()
    }

    //显示人员的详细信息
    showStaffDetailInfo() {
        let staffDataSources = this.viewer.dataSources.getByName('staffListLabelCollection')[0]
        staffDataSources.show = true
        // this.detailInfoShow = true
    }


    //隐藏人员的详细信息
    hideStaffDetailInfo() {
        let staffDataSources = this.viewer.dataSources.getByName('staffListLabelCollection')[0]
        staffDataSources.show = false
        // this.detailInfoShow = false
    }

    //显示人员的连线
    showStaffLine() {
        let staffDataSources = this.viewer.dataSources.getByName('staffListLineCollection')[0]
        staffDataSources.show = true
    }

    //隐藏人员的连线
    hideStaffLine() {
        let staffDataSources = this.viewer.dataSources.getByName('staffListLineCollection')[0]
        staffDataSources.show = false
    }

    //定位到某个人员
    location2Staff(staffData) {
        if (!staffData.relationWorkPlanid) return;
        //找到单个实体    进行单个人员的更新
        let findInstance = this.viewer.dataSources.getByName('staffListCollection')[0].entities.getById(staffData.relationWorkPlanid)  // this.myCustomDataSource.entities.getById(staffData.id)
        // let findInstance2 = this.viewer.entities.getById(staffData.id)

        if (!findInstance) return;
        //定位到该entity
        this.viewer.zoomTo(findInstance);
    }
}

//私用方法  绘制canvas   名称信息 
function _drawCanvasImageName(staffData) {
    // 创建一个 Canvas 元素并绘制内容
    let canvas = document.createElement('canvas');
    canvas.width = 250; // Canvas 的宽度
    canvas.height = 50; // Canvas 的高度
    let context = canvas.getContext('2d');
    context.fillStyle = '#23262ca3';  //背景颜色
    context.fillRect(0, 0, canvas.width, canvas.height);
    // 设置图片源
    let image = new Image();
    if (staffData.typeName == '安监部监督人') {
        image.src = ajbjdr  // 替换为你的图片路径
    } else if (staffData.typeName == '设备部监督人') {
        image.src = sbbjdr  // 替换为你的图片路径
    } else if (staffData.typeName == '运检部监督人') {
        image.src = yjbjdr  // 替换为你的图片路径
    } else if (staffData.typeName == '工作负责人') {
        image.src = gzfzr  // 替换为你的图片路径
    } else if (staffData.typeName == '工作班成员') {
        image.src = gzbcy  // 替换为你的图片路径
    } else if (staffData.typeName == '省级到岗') {
        image.src = dgdw  // 替换为你的图片路径
    } else if (staffData.typeName == '地市到岗') {
        image.src = dsdg  // 替换为你的图片路径
    } else if (staffData.typeName == '县级到岗') {
        image.src = xjdg  // 替换为你的图片路径
    }


    // 图片加载后绘制到 Canvas
    return new Promise((resolve, reject) => {
        image.onload = function () {
            // 绘制图片
            context.drawImage(image, 0, 0, 480, 480, 4, 4, 38, 38); // 在 Canvas 的左上角绘制图片
            // 添加文本
            context.fillStyle = 'white'; // 文本颜色
            // context.font = '18px Arial'; // 字体样式
            context.font = "bold 24px solid";
            let textLabel = '人员姓名'; // 要绘制的文本
            context.fillText(textLabel, 40, 32); // 绘制文本
            let textName = staffData.name; // 要绘制的文本
            context.fillText(textName, 150, 32); // 绘制文本
            let dataUrl = canvas.toDataURL(); // 这将返回一个 Data URL 字符串
            resolve(dataUrl)
        };
    })

}

//私用方法  绘制canvas  详情信息
function _drawCanvasImageDetailInfo(staffData) {
    // 创建一个 Canvas 元素并绘制内容
    let canvas = document.createElement('canvas');
    canvas.width = 250; // Canvas 的宽度
    canvas.height = 220; // Canvas 的高度
    let context = canvas.getContext('2d');
    context.fillStyle = '#23262ca3';  //背景颜色
    context.fillRect(0, 0, canvas.width, canvas.height);
    // 绘制图片
    // context.drawImage(image, 0, 0, 480, 480, 4, 4, 38, 38); // 在 Canvas 的左上角绘制图片
    // 添加文本
    // context.fillStyle = 'white'; // 文本颜色
    // // context.font = '18px Arial'; // 字体样式
    // let textLabel = '人员姓名'; // 要绘制的文本
    // context.fillText(textLabel, 40, 32); // 绘制文本
    // let textName = staffData.name; // 要绘制的文本
    // context.fillText(textName, 150, 32); // 绘制文本
    context.font = "bold 24px solid";
    context.fillStyle = staffData.color; // 文本颜色
    let lxLabel = '类型:'; // 要绘制的文本
    context.fillText(lxLabel, 10, 42); // 绘制文本
    context.fillStyle = 'white'; // 文本颜色
    let lxInfo = staffData.typeName; // 要绘制的文本
    context.fillText(lxInfo, 100, 42); // 绘制文本

    context.fillStyle = staffData.color; // 文本颜色
    let dwLabel = '单位:'; // 要绘制的文本
    context.fillText(dwLabel, 10, 92); // 绘制文本
    context.fillStyle = 'white'; // 文本颜色
    let dwInfo = 'xxx工作单位'; // 要绘制的文本
    context.fillText(dwInfo, 100, 92); // 绘制文本

    context.fillStyle = staffData.color; // 文本颜色
    let qyLabel = '区域:'; // 要绘制的文本
    context.fillText(qyLabel, 10, 142); // 绘制文本
    context.fillStyle = 'white'; // 文本颜色
    let qyInfo = staffData.area; // 要绘制的文本
    context.fillText(qyInfo, 100, 142); // 绘制文本

    context.fillStyle = staffData.color; // 文本颜色
    let rwLabel = '任务:'; // 要绘制的文本
    context.fillText(rwLabel, 10, 192); // 绘制文本
    context.fillStyle = 'white'; // 文本颜色
    let rwInfo = staffData.workPlanName; // 要绘制的文本
    context.fillText(rwInfo, 100, 192); // 绘制文本
    let dataUrl = canvas.toDataURL(); // 这将返回一个 Data URL 字符串

    return dataUrl
}

//睡眠函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
