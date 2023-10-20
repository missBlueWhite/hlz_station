//地图点击的管理
import * as Cesium from "cesium";
import { CesiumPopup } from './popup/index'  //弹窗的样式   目前所有的弹窗都是这个样式 
//漫游相关的类
import { RoamHandler } from './RoamHandler'

export class MapClickHandler {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //移除双击事件
        this.currentClickEntity = {
            type: '',
            entity: null
        };  //当前被点击到的entity
        this.clearCesiumPopups = null
        this.roamHandlerInstance = new RoamHandler(viewer)
        // this._initClickHandlerWatch(viewer)
    }


    //初始化点击事件的监听
    initMapClickHandle() {
        let viewer = this.viewer
        let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        handler.setInputAction((movement) => {
            let ray = viewer.camera.getPickRay(movement.position)
            let cartesianGlobePick = viewer.scene.globe.pick(ray, viewer.scene)
            let cartesianPickPosition = viewer.scene.pickPosition(movement.position)
            let pickObj = viewer.scene.pick(movement.position)
            if (Cesium.defined(pickObj) && pickObj.id?.id) {
                // let clickResId = this.handerClick(pickObj)
                // if (clickResId) {
                //     console.log('clickRes', clickResId)
                // }
                this.handerClick(pickObj)
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    }



    handerClick(clickEntity) {
        if (!clickEntity) return;
        let clickEntityId = clickEntity.id.id
        let clickEntityType = clickEntity.id.type
        console.log('clickEntity-----------------clickEntityId', clickEntityId)
        console.log('clickEntity-----------------clickEntityType', clickEntityType)
        if (clickEntityType == 'camera') {
            // =>todo  在此处根据clickEntityId进行后台接口的查找   查找到数据后  筛到params中进行弹窗数据的展示
            // =>假设params是后台已经请求到的数据
            let params = {
                name: 'xxxxx',
                data: "测试数据"
            }
            this._cameraClickHandler(clickEntity, params)
        } else if (clickEntityType == 'staff') {
            //=>todo在此点击人员的时候  需要根据人员的id进行后台的请求  获取到人员的信息
            //假设params是后台已经请求到的数据
            let params = {
                name: '人员111111111',
                level: "1",
                relationWorkPlanid: "003da06c-47e4-6267-2e75-7a38ed7db975"
            }
            this._staffClickHander(clickEntity, params)
        }
    }


    //相机的点击事件
    _cameraClickHandler(clickEntity, params) {
        let viewer = this.viewer
        let position = clickEntity.id.position._value  //位置信息 Cartesian3
        //从entity中获取相应的属性信息
        let name = params.name
        let testData = params.data
        let bodyHtml = ''
        bodyHtml += `<div class="cus-div" style="width:100%;">
             <div>
             <div><lalel style="width:100px;margin:auto 10px;display:inline-block;color:rgba(255, 255, 255, 0.85);font-size: 14px;">测试数据:</label><lalel style="margin-left:12px; display:inline-block;color:rgba(255, 255, 255, 0.85);font-size: 14px;">${testData}</label></div>
             </div>
        </div>`
        let headerHtml = ''
        headerHtml += `<svg style="vertical-align: middle;"  width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5C13.3125 2.5 16.0156 5.20312 16.0156 8.51562C16.0156 10.1094 15.4062 11.6094 14.2812 12.7344L14.1875 12.8125L10 16.9844L5.82812 12.8281L5.73438 12.7344C4.60938 11.6094 4 10.1094 4 8.51562C3.98438 5.20312 6.6875 2.5 10 2.5ZM10 1.25C5.98438 1.25 2.73438 4.5 2.73438 8.51562C2.73438 10.5 3.53125 12.3125 4.82812 13.625L10 18.75L15.1562 13.6094C16.4531 12.2969 17.25 10.5 17.25 8.5C17.2656 4.5 14.0156 1.25 10 1.25ZM10 6.25C11.4375 6.25 12.5938 7.46875 12.5 8.9375C12.4062 10.1719 11.4219 11.1562 10.1875 11.25C8.73437 11.3594 7.5 10.2031 7.5 8.75C7.5 7.375 8.625 6.25 10 6.25Z" fill="#F0F5FF" fill-opacity="0.95"/>
    </svg><label style="display: inline-block;vertical-align: middle;">${name}</label>
    `
        let a = new CesiumPopup({
            title: '摄像头信息'
        })
            .setPosition(position)
            .setHTML(bodyHtml)
            .addTo(viewer)
            .setTitle(headerHtml)
        a.on('close', function () {
            console.log('close')
        })
        a.on('open', function () {
            console.log('open')
        })
        // 保存CesiumPopup元素，以便管理
        this.clearCesiumPopups = a
    }

    //人员数据的点击弹窗显示
    _staffClickHander(clickEntity, params) {
        console.log('clickEntity', clickEntity)
        let viewer = this.viewer
        let position = clickEntity.id.position._value  //位置信息 Cartesian3
        console.log('position', position)
        //从entity中获取相应的属性信息
        let name = params.name
        let level = params.level
        let relationWorkPlanid = params.relationWorkPlanid
        let bodyHtml = ''
        bodyHtml += `<div class="cus-div" style="width:100%;">
             <div>
             <div><lalel style="width:50px;margin:auto 10px;display:inline-block;color:rgba(255, 255, 255, 0.85);font-size: 14px;">轨迹:</label><lalel id="staffPathId" style="margin-left:12px; display:inline-block;color:rgba(255, 255, 255, 0.85);font-size: 14px;cursor:pointer">${relationWorkPlanid}</label></div>
             <div><lalel style="width:50px;margin:auto 10px;display:inline-block;color:rgba(255, 255, 255, 0.85);font-size: 14px;">等级:</label><lalel style="margin-left:12px; display:inline-block;color:rgba(255, 255, 255, 0.85);font-size: 14px;">${level}</label></div>
             </div>
        </div>`
        let headerHtml = ''
        headerHtml += `<svg style="vertical-align: middle;"  width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5C13.3125 2.5 16.0156 5.20312 16.0156 8.51562C16.0156 10.1094 15.4062 11.6094 14.2812 12.7344L14.1875 12.8125L10 16.9844L5.82812 12.8281L5.73438 12.7344C4.60938 11.6094 4 10.1094 4 8.51562C3.98438 5.20312 6.6875 2.5 10 2.5ZM10 1.25C5.98438 1.25 2.73438 4.5 2.73438 8.51562C2.73438 10.5 3.53125 12.3125 4.82812 13.625L10 18.75L15.1562 13.6094C16.4531 12.2969 17.25 10.5 17.25 8.5C17.2656 4.5 14.0156 1.25 10 1.25ZM10 6.25C11.4375 6.25 12.5938 7.46875 12.5 8.9375C12.4062 10.1719 11.4219 11.1562 10.1875 11.25C8.73437 11.3594 7.5 10.2031 7.5 8.75C7.5 7.375 8.625 6.25 10 6.25Z" fill="#F0F5FF" fill-opacity="0.95"/>
    </svg><label style="display: inline-block;vertical-align: middle;">${name}</label>
    `
        let a = new CesiumPopup({
            title: '人员信息'
        })
            .setPosition(position)
            .setHTML(bodyHtml)
            .addTo(viewer)
            .setTitle(headerHtml)
        a.on('close', function () {
            console.log('close')
        })
        a.on('open', function () {
            console.log('open')
        })
        // 保存CesiumPopup元素，以便管理
        this.clearCesiumPopups = a
        setTimeout(() => {
            let clickDom = document.getElementById('staffPathId')
            clickDom.onclick = () => {
                let staffPathId = clickDom.innerText
                console.log('点击了轨迹',staffPathId)
                // todo=>根据id获取人员的轨迹    然后进行轨迹的展示
                this.roamHandlerInstance.startRoam()
            }
        }, 500)

    }


}