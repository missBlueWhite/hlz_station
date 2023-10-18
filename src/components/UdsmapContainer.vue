<template>
  <div style="width: 100%; height: 100%;">
    <div class="cesiumContainer" style="width: 100%; height: 100%; overflow: hidden"></div>
    <div class="map-tool">
      <input type="button" value="更新单个人员位置信息" @click="updateSingeStaffPosition">
      <input type="button" value="更新所有人员位置信息" @click="updateAllStaffPosition">
      <input type="button" value="停止所有人员位置信息" @click="stopAllStaffPosition">
      <input type="button" value="清空单个人员位置信息" @click="clearSingleStaffPosition">
      <input type="button" value="清空所有人员位置信息" @click="clearAllStaffPosition">
      <input type="button" value="显示人员详细信息" @click="showStaffDetailInfo">
      <input type="button" value="隐藏人员详细信息" @click="hideStaffDetailInfo">
      <input type="button" value="显示人员连线" @click="showStaffLine">
      <input type="button" value="隐藏人员连线" @click="hideStaffLine">
      <input type="button" value="定位到某个人员" @click="location2Staff">
      <input type="button" value="添加相机" @click="addCameraDialogShow">
    </div>
    <div class="camera-dialog" v-show="cameraDialog">
      <div>相机名称:<input class="camera-dialog-name" type="text" /></div>
      <div>相机ID:<input class="camera-dialog-id" type="text" /></div>
      <div>相机类型:<input class="camera-dialog-type" type="text" /></div>
      <div>是否在线:<input class="camera-dialog-online" type="text" /></div>
      <label>信息添加完成后，在地图上进行点击添加相机点位</label>
      <input type="button" value="确定" @click="addCameraData" />
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onUnmounted } from "vue";
import * as Cesium from "cesium";

//uds插件
import { udCesium } from '../utils/udCesium'
//天空盒子
import SkyBoxOnGround from '../utils/skyBoxOnGround.js'
//天空盒子图片
import nx2 from '../assets/skyImg/nx.png'
import ny2 from '../assets/skyImg/ny.png'
import nz2 from '../assets/skyImg/nz.png'
import px2 from '../assets/skyImg/px.png'
import py2 from '../assets/skyImg/py.png'
import pz2 from '../assets/skyImg/pz.png'

//地图点击类的操作
import { MapClickHandler } from '../utils/clickHandle'

//相机管理相关的操作
import { CameraManager } from '../utils/CameraManager'
//人员的管理操作
import { StaffManage } from '../utils/StaffManage'
//相机管理的数据 、人员管理的数据
import { cameraList, staffList, fourBoundaries } from '../mockData/mockData'
//场景区域的监听管理
import { SceneAreaManager } from '../utils/SceneAreaManager'





//相机管理的实例的局部全局变量
let cameraManagerInstance: any = null
//场景管理的全局变量
let sceneAreaManagerInstance: any = null
//人员管理的全局变量
let staffManageInstance: any = null

//声明全局的变量
let _viewer: any = null

//相机弹窗信息的显示
const cameraDialog = ref(false)
const isAddCameraData = ref(false)

const props = defineProps({
  message: String,
  imageAlpha: Number,
  position: [Number, Number, Number],
})

let loadUdsIntervalIndex: any = null
//加载uds模型
const loadUdsModel = async (viewer: any) => {
  let csEulee = new udCesium(viewer);
  let udsModel = {
    key: "zgmx",
    url: "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20230829/65eac27152bba461c88d400481f48758.uds",     //纠偏了的模型  
    // url: "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20231012/0a781561b09f4d398251cb6d5bf8eedf.uds",        //昌吉 
    // url: 'https://10.11.8.118:8443/uds/changji2023new0703.uds',
    // url: 'http://21.82.116.98:61004/test.uds',
    // url:'http://21.82.116.98:61004/cjhlz.uds',
    // eval: [100.0, 4978],
    // offsetPosition: [6, 25, -517.2]  //内网仓吉模型的纠偏量
    offsetPosition: [0, 0, -9.2],
  };
  // csEulee.loadUds(udsModel, [68534.36702072641, 4544158.915943371, 4460432.1562001])
  csEulee.loadUds(udsModel)
}

//初始化底图
const initMap = (container: HTMLElement) => {

  // //更改默认底图
  // let imageryViewModels = [];
  // let localMap = new Cesium.ProviderViewModel({
  //   name: "天地图街道",
  //   tooltip: "天地图街道数据",
  //   iconUrl: "./sampleData/images/tianditu.jpg",
  //   creationFunction: function () {
  //     return new Cesium.UrlTemplateImageryProvider({
  //       url: 'http://10.11.4.20/MapServer/mbtiles/arcgis_yx_jiangsu1-17/{x}/{y}/{z}', //服务地址
  //     })
  //   }
  // });
  // imageryViewModels.push(localMap)

  _viewer = new Cesium.Viewer(container, {
    infoBox: false,
    selectionIndicator: false,
    animation: true,
    shouldAnimate: true,
    timeline: false,
    baseLayerPicker: false,
    vrButton: false, // VR模式
    geocoder: false,//地理编码搜索组件
    homeButton: false,//首页 点击之后视图将跳转到默认视角
    sceneModePicker: false,//场景模式 切换2D 3D和 Columbus View（cv）模式
    navigationHelpButton: false,//帮助提示，如何操作数字地球
    fullscreenButton: false,
    // baseLayerPicker: false,
    // baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
    //   url: 'http://21.82.116.98:61002/MapServer/mbtiles/global0-10xinjiang11-16/{x}/{y}/{z}', //服务地址
    // })),
  })

  // todo=> 在内网里面上述的底图地址换成内网的地址
  // 内网地址如下：http://21.82.116.98:61002/MapServer/mbtiles/global0-10xinjiang11-16/{x}/{y}/{z}

  // let localImageProvider = new Cesium.UrlTemplateImageryProvider({
  //   url: 'http://10.11.4.20/MapServer/mbtiles/arcgis_yx_jiangsu1-17/{x}/{y}/{z}', //服务地址
  // })
  // _viewer.imageryLayers.addImageryProvider(localImageProvider);

  window.udsMapviewer = _viewer;

  _viewer._cesiumWidget._creditContainer.style.display = "none";  //隐藏
  // 隐藏 animation 控件
  _viewer.animation.container.style.visibility = 'hidden';

  setTimeout(() => {
    addDymicLine()
  }, 6000)


  // // 创建一个函数，用于更新相机信息
  // function updateCameraInfo() {
  //   // 获取当前相机
  //   var camera = _viewer.camera;

  //   // 打印相机的位置和方向
  //   console.log('Camera Position:', camera.position);
  //   console.log('Camera Direction:', camera.direction);
  //   console.log('Camera Up:', camera.up);
  //   console.log('Camera Right:', camera.right);

  //   // 打印相机的方位角、俯仰角和滚转角（以弧度为单位）
  //   console.log('Camera Heading (Radians):', camera.heading);
  //   console.log('Camera Pitch (Radians):', camera.pitch);
  //   console.log('Camera Roll (Radians):', camera.roll);

  //   // 使用requestAnimationFrame继续更新相机信息
  //   requestAnimationFrame(updateCameraInfo);
  // }

  // // 启动相机信息更新
  // updateCameraInfo();


}

//测试加载动态的折线
const addDymicLine = () => {
  console.log('add line--------')
  //更新连线的位置
  // 创建一个SampledPositionProperty对象
  let linePath = new Cesium.SampledPositionProperty();

  // 添加线的坐标样本
  let startTime = Cesium.JulianDate.now();
  linePath.addSample(startTime, Cesium.Cartesian3.fromDegrees(113.52987165698563, 22.80379039702072, 0));
  linePath.addSample(Cesium.JulianDate.addSeconds(startTime, 1.0, new Cesium.JulianDate()), Cesium.Cartesian3.fromDegrees(113.52987165698563, 22.80379039702072, 10000));
  linePath.addSample(Cesium.JulianDate.addSeconds(startTime, 2.0, new Cesium.JulianDate()), Cesium.Cartesian3.fromDegrees(113.52987165698563, 22.80379039702072, 1000));

  // 创建线实体
  let lineEntity = _viewer.entities.add({
    polyline: {
      positions: linePath,
      width: 5,
      material: Cesium.Color.RED,
    },
  });

  // 设置时间轴以观察线的动画效果
  _viewer.clock.startTime = startTime.clone();
  _viewer.clock.stopTime = Cesium.JulianDate.addSeconds(startTime, 4.0, new Cesium.JulianDate());
  _viewer.clock.currentTime = startTime.clone();
  _viewer.clock.multiplier = 1;
  _viewer.clock.shouldAnimate = true;

  _viewer.zoomTo(lineEntity);
}

//新建天空盒子
const addSkyBox = () => {
  return new SkyBoxOnGround({
    sources: {
      positiveX: px2,
      negativeX: nx2,
      positiveY: pz2,
      negativeY: nz2,
      positiveZ: py2,
      negativeZ: ny2
    }
  });
}




//相机管理
const cameraManagerFun = () => {
  cameraManagerInstance = new CameraManager(_viewer)
  cameraManagerInstance.initCameraList(cameraList)
}

//人员管理
const staffManageFun = () => {
  staffManageInstance = new StaffManage(_viewer)
  //模拟出100个人员点位
  // 四个边界点
  let north = Cesium.Cartesian3.fromDegrees(113.55941409163184, 22.828641109181433, -6293.092289876425);
  let south = Cesium.Cartesian3.fromDegrees(113.54573254633885, 22.788190800142154, 24.22807656497653);
  let east = Cesium.Cartesian3.fromDegrees(113.58270303583768, 22.81109651663857, 14.762031100928155);
  let west = Cesium.Cartesian3.fromDegrees(113.52072236815425, 22.790357359271056, 1.1299940307549188);

  //模拟数据 插值100个随机点////////////////////////////////////
  let staffListRes = []
  let originPoint = [113.5493956319916, 22.79948679264272, 0.46735028600700784]
  let colors = ['#DF5D5D', '#67DF5D', '#5DDFCE', '#3668B1', '#AD4ECB', '#E77B4F', '#9189D0', '#EA91A4']
  let typeNameList = ['安监部监督人', '省级到岗', '地市到岗', '工作班成员', '工作负责人', '设备部监督人', '县级到岗', '运检部监督人']
  let centerPointList = [
    [113.52921733495529, 22.800116860285616, -1.5081470232585377],
    [113.54117399137431, 22.80142973544119, 4.637629094364569],
    [113.56124820736514, 22.80435789438329, 3.132505723890629],
    [113.54751992958181, 22.805140002373346, 2.3600184408125617],
    [113.55316928015714, 22.80546220633305, 13.940619346345267],
    [113.55864671621023, 22.81078628143312, 45.6525841996821],
    [113.5660295586771, 22.807353875058034, 40.493010328602494],
    [113.52900272911997, 22.788773176003975, 8.451228577763636],
  ]
  for (let i = 0; i < 60; i++) {
    let randomInteger = Math.floor(Math.random() * 8);
    // 获取经度和纬度
    let longitude = originPoint[0] + Math.random() * 0.01;
    let latitude = originPoint[1] + Math.random() * 0.01;
    let height = 10 // cartographic.height; // 高度
    let staffItem = {
      name: '张三' + i,
      relationWorkPlanid: '003da06c' + i,
      level: Math.floor(Math.random() * 5) + 1,
      point: [longitude, latitude, height],
      typeName: typeNameList[randomInteger],// "工作负责人",
      unitName: "超高压",
      area: "750kv交流区",
      workPlanName: "升级改造",
      color: colors[randomInteger], // "#FFCDFF",
      type: "Addupdate",
      centerPoint: centerPointList[randomInteger],
      isAlarm: Math.random() > 0.5 ? false : true
    }
    staffListRes.push(staffItem)
  }


  ////////////////////以上都是模拟数据   后期需要从数据库取///////////////////
  staffManageInstance.initStaffList(staffListRes)
}

const sceneManageFun = () => {
  let sceneAreaManagerInstance = new SceneAreaManager(_viewer)
  sceneAreaManagerInstance.initMapAreaInsiteListen()
}

//初始化地图的点击监听事件
// const initMapClickHandle = () => {
//   let handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas)
//         handler.setInputAction((movement:any) => {
//             let ray = _viewer.camera.getPickRay(movement.position)
//             let cartesianGlobePick = _viewer.scene.globe.pick(ray, _viewer.scene)
//             let cartesianPickPosition = _viewer.scene.pickPosition(movement.position)
//             let pickObj = _viewer.scene.pick(movement.position)
//             if (Cesium.defined(pickObj) && pickObj.id?.id) {
//                 // let clickResId = this.handerClick(pickObj)
//                 // if (clickResId) {
//                 //     console.log('clickRes', clickResId)
//                 // }
//             }

//         }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
// }

//更新单个人员的位置信息
const updateSingeStaffPosition = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  let staffData = {
    // id: '003da06c-47e4-6267-2e75-7a38ed7db975',
    relationWorkPlanid: '003da06c1',
    point: [113.5493956319916, 22.79948679264272, 0.46735028600700784],
    centerPoint: [113.52921733495529, 22.800116860285616, -1.5081470232585377]
  }
  staffManageInstance.updateSingleStaff(staffData)
}

//睡眠函数
const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//更新所有的人员信息的位置
let setTimIntervalIndex
// const updateAllStaffPosition = async () => {
//   if (!staffManageInstance) {
//     staffManageInstance = new StaffManage(_viewer)
//   }
//   //更新频率  两秒请求一次接口
//   setTimIntervalIndex = setInterval(() => {
//     let staffListRes = []
//     let originPoint = [113.5493956319916, 22.79948679264272, 0.46735028600700784]
//     let colors = ['#DF5D5D', '#67DF5D', '#5DDFCE', '#3668B1', '#AD4ECB', '#E77B4F', '#9189D0', '#EA91A4']
//     let typeNameList = ['安监部监督人', '省级到岗', '地市到岗', '工作班成员', '工作负责人', '设备部监督人', '县级到岗', '运检部监督人']
//     let centerPointList = [
//       [113.52921733495529, 22.800116860285616, -1.5081470232585377],
//       [113.54117399137431, 22.80142973544119, 4.637629094364569],
//       [113.56124820736514, 22.80435789438329, 3.132505723890629],
//       [113.54751992958181, 22.805140002373346, 2.3600184408125617],
//       [113.55316928015714, 22.80546220633305, 13.940619346345267],
//       [113.55864671621023, 22.81078628143312, 45.6525841996821],
//       [113.5660295586771, 22.807353875058034, 40.493010328602494],
//       [113.52900272911997, 22.788773176003975, 8.451228577763636],
//     ]
//     for (let i = 0; i < 10; i++) {
//       let randomInteger = Math.floor(Math.random() * 8);
//       // 获取经度和纬度
//       let longitude = originPoint[0] + Math.random() * 0.01;
//       let latitude = originPoint[1] + Math.random() * 0.01;
//       let height = 10 // cartographic.height; // 高度
//       let staffItem = {
//         name: '张三' + i,
//         relationWorkPlanid: '003da06c' + i,
//         level: Math.floor(Math.random() * 5) + 1,
//         point: [longitude, latitude, height],
//         typeName: typeNameList[randomInteger],// "工作负责人",
//         unitName: "超高压",
//         area: "750kv交流区",
//         workPlanName: "升级改造",
//         color: colors[randomInteger], // "#FFCDFF",
//         type: "Addupdate",
//         centerPoint: centerPointList[randomInteger],
//         isAlarm: Math.random() > 0.5 ? false : true
//       }
//       staffListRes.push(staffItem)
//     }
//     staffManageInstance.updataStaffList(staffListRes)
//     console.log('updateAllStaffPosition--------------')
//   }, 2000)
// }


const updateAllStaffPosition = async () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  //更新频率  两秒请求一次接口

  setTimIntervalIndex = setInterval(() => {
    let staffListRes = []   //模拟更新的数据结果
    let originPoint = [113.5493956319916, 22.79948679264272, 0.46735028600700784]
    let colors = ['#DF5D5D', '#67DF5D', '#5DDFCE', '#3668B1', '#AD4ECB', '#E77B4F', '#9189D0', '#EA91A4']
    let typeNameList = ['安监部监督人', '省级到岗', '地市到岗', '工作班成员', '工作负责人', '设备部监督人', '县级到岗', '运检部监督人']
    let centerPointList = [
      [113.52921733495529, 22.800116860285616, -1.5081470232585377],
      [113.54117399137431, 22.80142973544119, 4.637629094364569],
      [113.56124820736514, 22.80435789438329, 3.132505723890629],
      [113.54751992958181, 22.805140002373346, 2.3600184408125617],
      [113.55316928015714, 22.80546220633305, 13.940619346345267],
      [113.55864671621023, 22.81078628143312, 45.6525841996821],
      [113.5660295586771, 22.807353875058034, 40.493010328602494],
      [113.52900272911997, 22.788773176003975, 8.451228577763636],
    ]
    for (let i = 0; i < 10; i++) {
      let randomInteger = Math.floor(Math.random() * 8);
      // 获取经度和纬度
      let longitude = originPoint[0] + Math.random() * 0.01;
      let latitude = originPoint[1] + Math.random() * 0.01;
      let height = 10 // cartographic.height; // 高度
      let staffItem = {
        name: '张三' + i,
        relationWorkPlanid: '003da06c' + i,
        level: Math.floor(Math.random() * 5) + 1,
        point: [longitude, latitude, height],
        typeName: typeNameList[randomInteger],// "工作负责人",
        unitName: "超高压",
        area: "750kv交流区",
        workPlanName: "升级改造",
        color: colors[randomInteger], // "#FFCDFF",
        type: "Addupdate",
        centerPoint: centerPointList[randomInteger],
        isAlarm: Math.random() > 0.5 ? false : true
      }
      staffListRes.push(staffItem)
    }
    // staffManageInstance.updataStaffList(staffListRes)
    console.log('updateAllStaffPosition--------------')
  }, 2000)

}

//停止更新所有的人员信息的位置
const stopAllStaffPosition = () => {
  clearInterval(setTimIntervalIndex)
}

//清空所有人员
const clearAllStaffPosition = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  staffManageInstance.clearAllStaff()
}

//显示人员的详细信息
const showStaffDetailInfo = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  staffManageInstance.showStaffDetailInfo()
}

//隐藏人员的详细信息
const hideStaffDetailInfo = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  staffManageInstance.hideStaffDetailInfo()
}

//显示人物的联线
const showStaffLine = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  staffManageInstance.showStaffLine()
}

//隐藏人物的联线
const hideStaffLine = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  staffManageInstance.hideStaffLine()
}

//定位到某个人员
const location2Staff = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }
  let staffData = {
    // id: '003da06c-47e4-6267-2e75-7a38ed7db975',
    relationWorkPlanid: '003da06c1',
    point: [113.5493956319916, 22.79948679264272, 0.46735028600700784]
  }
  staffManageInstance.location2Staff(staffData)
}


//清楚单个人员位置信息
const clearSingleStaffPosition = () => {
  if (!staffManageInstance) {
    staffManageInstance = new StaffManage(_viewer)
  }

  let staffData = {
    // id: '003da06c-47e4-6267-2e75-7a38ed7db975',
    relationWorkPlanid: '003da06c1',
    point: [113.5493956319916, 22.79948679264272, 0.46735028600700784]
  }
  staffManageInstance.deleteStaff(staffData)
}

//手动添加相机
const addCameraDialogShow = () => {
  console.log('添加相机')
  cameraDialog.value = true
}

const addCameraData = () => {
  console.log('添加相机数据')
  cameraDialog.value = false
  isAddCameraData.value = true
}


onMounted(() => {
  const container = document.querySelector('.cesiumContainer') as HTMLElement;
  //初始化地图
  initMap(container)
  //地图的监听事件
  //地图的点击事件
  let mapClickHandleInstance = new MapClickHandler(_viewer)
  // mapClickHandleInstance.initMapClickHandle()

  //地图区域位置的监听
  sceneManageFun()

  let handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas)
  handler.setInputAction((movement: any) => {
    let ray = _viewer.camera.getPickRay(movement.position)
    let cartesianGlobePick = _viewer.scene.globe.pick(ray, _viewer.scene)
    let cartesianPickPosition = _viewer.scene.pickPosition(movement.position)

    let pickObj = _viewer.scene.pick(movement.position)
    if (isAddCameraData.value) {
      console.log('添加相机数据')
      // 将笛卡尔坐标转换为经纬度坐标
      let ellipsoid = Cesium.Ellipsoid.WGS84; // 或者你可以选择其他椭球体
      let cartographic = ellipsoid.cartesianToCartographic(cartesianPickPosition);
      // 获取经度和纬度
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let height = cartographic.height; // 高度
      console.log('经度：', longitude);
      console.log('纬度：', latitude);
      console.log('高度：', height);
      let cameraData = {
        id: document.querySelector('.camera-dialog-id')?.value || undefined,
        name: document.querySelector('.camera-dialog-name')?.value || undefined,
        devType: document.querySelector('.camera-dialog-type')?.value || undefined,
        onLine: document.querySelector('.camera-dialog-online')?.value || undefined,
        point: [longitude, latitude, height]
      }
      if (!cameraData.id || !cameraData.name || !cameraData.onLine) {
        alert('请填写完整的相机信息')
        return
      }
      if (cameraManagerInstance && cameraManagerInstance.cameraList.some((item: any) => item.id === cameraData.id)) {
        alert('相机ID已存在')
        return
      }
      cameraManagerInstance.addCamera(cameraData)
      isAddCameraData.value = false
    } else if (Cesium.defined(pickObj) && pickObj.id?.id) {
      mapClickHandleInstance.handerClick(pickObj)
    }

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)




  //更换天空盒
  let defaultSkyBox = _viewer.scene.skyBox
  let newSkyBox = addSkyBox()
  _viewer.scene.postRender.addEventListener(() => {
    let e = _viewer.camera.position
    // console.log('height:', Cesium.Cartographic.fromCartesian(e).height)
    if (Cesium.Cartographic.fromCartesian(e).height < 2500) {
      // 显示自定义的天空盒
      _viewer.scene.skyBox = newSkyBox
      _viewer.scene.skyAtmosphere.show = false;
    } else {
      _viewer.scene.skyBox = defaultSkyBox
      _viewer.scene.skyAtmosphere.show = true;
    }
  })



  //相机管理
  cameraManagerFun()
  //人员管理
  staffManageFun()

  loadUdsIntervalIndex = setInterval(() => {
    if (window.udsdkInitStatus) {
      clearInterval(loadUdsIntervalIndex)
      loadUdsModel(_viewer)
    }
  }, 1000);
})


onUnmounted(() => {
  _viewer.destroy()
})


</script>
<style scoped>
.map-tool {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 20px;
  right: 20px;
  z-index: 999;
}

.camera-dialog {
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 999;
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

}
</style>
