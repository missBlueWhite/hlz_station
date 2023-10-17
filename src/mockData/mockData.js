//相机数据
export const fourBoundaries = [
    {
        "name": "north", //北
        "coord": [113.55941409163184, 22.828641109181433, -6293.092289876425]
    }, {
        "name": "south", //南
        "coord": [113.54573254633885, 22.788190800142154, 24.22807656497653]
    }, {
        "name": "east",  //东
        "coord": [113.58270303583768, 22.81109651663857, 14.762031100928155]
    }, {
        "name": "west",  //北
        "coord": [113.52072236815425, 22.790357359271056, 1.1299940307549188]
    }]

export const cameraList = [
    {
        "name": "摄像机1",
        "id": "37050000001320000002",
        "devType": "枪机",
        "onLine": true,
        "point": [113.577875, 22.807927, 16.9]   //具体点位给出建议 让现场收集 最好支持地图内部移动
    },
    {
        "name": "摄像机2",
        "id": "37050000001320000003",
        "devType": "球机",
        "onLine": true,
        "point": [113.576696, 22.809905, 10.6]   //具体点位给出建议 让现场收集 最好支持地图内部移动
    },
    {
        "name": "摄像机2",
        "id": "37050000001320000004",
        "devType": "球机",
        "onLine": true,
        "point": [113.532766, 22.804591, 5.8]   //具体点位给出建议 让现场收集 最好支持地图内部移动
    },
    {
        "name": "摄像机2",
        "id": "37050000001320000005",
        "devType": "球机",
        "onLine": true,
        "point": [113.53716, 22.804887, 5.3]   //具体点位给出建议 让现场收集 最好支持地图内部移动
    },
    {
        "name": "摄像机2",
        "id": "37050000001320000006",
        "devType": "球机",
        "onLine": true,
        "point": [113.546491, 22.799762, 4.7]   //具体点位给出建议 让现场收集 最好支持地图内部移动
    }
]


//人物数据
export const staffList = [
    {
        "name": "亚森·吐鲁洪/13111275081",//人员项目
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db975",//关联任务ID
        "level": "1",//作业风险等级 1到5,  0 是未关联任务
        "point": [113.55273544233631, 22.8005772092608, 1.7328965253241346],//北斗坐标
        "typeName": "工作负责人",
        "unitName": "超高压",
        "area": "750kv交流区",
        "workPlanName": "升级改造",
        "color": "#FFCDFF",
        "type": "Addupdate",             //类型 更新添加  删除
        "centerPoint": [
            113.56632966639225,
            22.8039452334919,
            11.937095823122652
        ],
        "isAlarm": false
    },
    {
        "name": "亚森4/13221275081",
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db976",
        "level": "2",
        "point": [113.5493956319916, 22.79948679264272, 0.46735028600700784],
        "typeName": "工作负责人",
        "unitName": "超高压",
        "area": "750kv交流区",
        "workPlanName": "升级改造",
        "color": "#FFCDFF",
        "type": "Addupdate",
        "centerPoint": [
            113.56632966639225,
            22.8039452334919,
            11.937095823122652
        ],
        "isAlarm": false
    },
    {
        "name": "亚森3/13111275081",
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db977",
        "level": "3",
        "point": [113.55227556525172, 22.798397727837312, 6.066158029801241],
        "typeName": "工作负责人",
        "unitName": "超高压",
        "area": "750kv交流区",
        "workPlanName": "升级改造",
        "color": "#174AAA",
        "type": "Addupdate",
        "centerPoint": [
            113.56632966639225,
            22.8039452334919,
            11.937095823122652
        ],
        "isAlarm": false
    },
    {
        "name": "亚森2/13111275081",
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db978",
        "level": "4",
        "point": [113.584875, 22.818927, 16.9],
        "typeName": "工作负责人",
        "unitName": "超高压",
        "area": "750kv交流区",
        "workPlanName": "升级改造",
        "color": "#EB9925",
        "type": "Del",
        "centerPoint": [
            113.56632966639225,
            22.8039452334919,
            11.937095823122652
        ],
        "isAlarm": false
    }
]

//更新的人物数据
export const staffUpdateList = [
    {
        "name": "亚森·吐鲁洪/13111275081",//人员项目
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db975",//关联任务ID
        "level": "1",//作业风险等级 1到5,  0 是未关联任务
        "point": [113.55273544233631, 22.8005772092608, 1.7328965253241346],//北斗坐标
        "type": "Addupdate",             //类型 更新添加  删除
    },
    {
        "name": "亚森4/13221275081",
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db976",
        "level": "2",
        "point": [113.5493956319916, 22.79948679264272, 0.46735028600700784],
        "type": "Addupdate"
    },
    {
        "name": "亚森3/13111275081",
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db977",
        "level": "3",
        "point": [113.55227556525172, 22.798397727837312, 6.066158029801241],
        "type": "Addupdate"
    },
    {
        "name": "亚森2/13111275081",
        "relationWorkPlanid": "003da06c-47e4-6267-2e75-7a38ed7db978",
        "level": "4",
        "point": [113.584875, 22.818927, 16.9],
        "type": "Del"
    }
]


//具体人员的轨迹数据
export const personTrackData = [
    {
        "Time": "2023-09-22 12:00:00",
        "point": [113.52987165698563, 22.80379039702072, 0.8444008388955215]
    },
    {
        "Time": "2023-09-22 12:00:02",
        "point": [113.53278311615425, 22.80327611662719, -0.9615703210099369]
    },
    {
        "Time": "2023-09-22 12:00:03",
        "point": [113.53645493499842, 22.803311483725963, 22.803311483725963]
    },
    {
        "Time": "2023-09-22 12:00:03",
        "point": [113.54123866381809, 22.80339708183446, -0.2295875645923382]
    },
    {
        "Time": "2023-09-22 12:00:03",
        "point": [113.54095678716851, 22.799803666956308, 0.9348839673871481]
    },
    {
        "Time": "2023-09-22 12:00:03",
        "point": [113.54030781773946, 22.796328978719423, 9.419586548840925]
    }
    
]

//场景数据
export const sceneList = [
    {
        "name": "综合楼",
        "id": "1",
        // "region": [113.56710521296824, 22.804882344370064, 21.25797538080602, 113.56687628287652, 22.800986142220307, 5.302958298119665, 113.56241363697572, 22.801220775965117, 0.37206781183093934, 113.56215091819425, 22.804756815063946, 3.8611534564915324],    //区域范围
        "region": [113.56710521296824, 22.804882344370064, 113.56687628287652, 22.800986142220307, 113.56241363697572, 22.801220775965117, 113.56215091819425, 22.804756815063946],    //区域范围
        "center": [113.56632966639225, 22.8039452334919, 11.937095823122652],    //中心点
        "type": "xz",      //类型  xz  => 行政   cc => 存储  dd=>带电设备  jx=>检修设备
    },
    {
        "name": "一次备用品库",
        "id": "2",
        // "region": [113.56186019801586, 22.804828348911453, 2.7336675185052255, 113.56189043162875, 22.80359427673386, 5.094285465343822, 113.56062913737581, 22.803580918623222, 7.002332491688532, 113.56065482526333, 22.805034367241, 2.3335805227236106],    //区域范围
        "region": [113.56186019801586, 22.804828348911453, 113.56189043162875, 22.80359427673386, 113.56062913737581, 22.803580918623222, 113.56065482526333, 22.805034367241],    //区域范围
        "center": [113.56124820736514, 22.80435789438329, 3.132505723890629],    //中心点
        "type": "cc",      //类型
    },
    {
        "name": "第一大组交流滤波器场",
        "id": "3",
        // "region": [113.56027656464948, 22.801670480068243, 20.18719058170081, 113.55836521825134, 22.80160287970434, 5.058872800395226, 113.55834546631222, 22.802567342818676, 2.0504495797711644, 113.56029415741665, 22.802564723106997, 9.217553295591742],    //区域范围
        "region": [113.56027656464948, 22.801670480068243, 113.55836521825134, 22.80160287970434, 113.55834546631222, 22.802567342818676, 113.56029415741665, 22.802564723106997],    //区域范围
        "center": [113.55917092066663, 22.80212870496353, 1.1528984067944141],    //中心点
        "type": "dd",      //类型
    },
    {
        "name": "第二大组交流滤波器场",
        "id": "3",
        "region": [113.52234581507038, 22.7924106609065, 113.52740026386697, 22.791362698572307, 113.52648828517187, 22.78675347540636, 113.52145050298307, 22.78856942794896],    //区域范围
        "center": [113.52432156647828, 22.7899081300894, -2.9685764084961064],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "第三大组交流滤波器场",
        "id": "4",
        "region": [113.5274082130057, 22.791304460908272, 113.53143500487172, 22.790862501970075, 113.53255276707196, 22.781844372106683, 113.52655297146089, 22.78638308401871],    //区域范围
        "center": [113.52900272911997, 22.788773176003975, 8.451228577763636],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "第四大组交流滤波器场",
        "id": "5",
        "region": [113.53142456895841, 22.790846332023733, 113.5312788123088, 22.787562395007463, 113.53312851832328, 22.787337374358334, 113.53363242914071, 22.790737882424455],    //区域范围
        "center": [113.53219092884315, 22.789787629487797, 11.410263130720026],    //中心点
        "type": "jx",      //类型
    },

    {
        "name": "极Ⅰ户内直流场",
        "id": "6",
        "region": [113.53358058293932, 22.790690157249525, 113.53901799134185, 22.790433087341228, 113.54068659517495, 22.784630397686644, 113.53336215818028, 22.787308916552117],    //区域范围
        "center": [113.53556425010196, 22.78873694769617, 4.555067564480255],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "极Ⅰ高端阀厅",
        "id": "4",
        "region": [113.5393811891476, 22.791229722277723, 113.53707944915163, 22.78576755903351, 113.5409635415533, 22.78763471257533, 113.54074777014968, 22.791492684034008],    //区域范围
        "center": [113.53977571182226, 22.789316975914954, 2.557027133361354],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "极Ⅰ低端阀厅",
        "id": "7",
        "region": [113.54095191650853, 22.791377270244983, 113.54139809727275, 22.789898600256073, 113.54354472389196, 22.79152878271749, 113.54511624651643, 22.788393460099535],    //区域范围
        "center": [113.54234912659616, 22.79073613989179, 6.937343648763511],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "极Ⅱ低端阀厅",
        "id": "8",
        "region": [113.53942337431786, 22.79120552059186, 113.54007480222629, 22.793839992405292, 113.54390243169674, 22.793227646596723, 113.54320207369912, 22.79140948401347],    //区域范围
        "center": [113.54160478579996, 22.792394851872167, 8.936516799857861],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "主控楼",
        "id": "9",
        "region": [113.53999505666364, 22.794033008817586, 113.54035906691452, 22.796061503932343, 113.54320209438706, 22.795474982251683, 113.5427759931381, 22.79353304576293],    //区域范围
        "center": [113.54167146373187, 22.79481459718763, 2.357886182694074],    //中心点
        "type": "xz",      //类型
    },
    {
        "name": "极Ⅱ户内直流场",
        "id": "10",
        "region": [113.53798555457483, 22.79460556381662, 113.53847397861712, 22.796512639573788, 113.54012388619655, 22.796127502086094, 113.53982844827962, 22.7942893089175],    //区域范围
        "center": [113.53918525612013, 22.79522702715834, 5.1150333255719485],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "极Ⅱ高端阀厅",
        "id": "11",
        "region": [113.5347478487923, 22.795331806635104, 113.53505177859267, 22.797110678950276, 113.53833177176651, 22.796471728593637, 113.5347491439302, 22.79519387562657],    //区域范围
        "center": [113.53652877589917, 22.796006346685985, 0.3876230702865957],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌彩Ⅰ",
        "id": "12",
        "region": [113.5403654232477, 22.796246956863495, 113.5409936477721, 22.79925107555823, 113.54333076981543, 22.798564491459896, 113.54301299336086, 22.79569868775609],    //区域范围
        "center": [113.54213504263882, 22.797570461745693, -0.4984228673936492],    //中心点
        "type": "dd",      //类型
    },
    {
        "name": "昌彩Ⅱ",
        "id": "13",
        "region": [113.53528615579978, 22.797182002338836, 113.53567481779938, 22.799285088246524, 113.54091304177436, 22.799199055361193, 113.5400985288269, 22.796216121750906],    //区域范围
        "center": [113.53801013365133, 22.797933441565906, 1.962398766983851],    //中心点
        "type": "dd",      //类型
    },
    {
        "name": "昌彩Ⅲ",
        "id": "14",
        "region": [113.53028091503836, 22.798291141952127, 113.53252588397223, 22.80321720617266, 113.53640193428897, 22.80317650373716, 113.5347071485534, 22.797278116731235],    //区域范围
        "center": [113.53349963145395, 22.799811727726713, -0.5324084690888502],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "潞安电厂",
        "id": "15",
        "region": [113.53576298697888, 22.799645667293348, 113.53661566361848, 22.80332414698766, 113.54501143130969, 22.80315303852485, 113.54605884073354, 22.799563384221674],    //区域范围
        "center": [113.54117399137431, 22.80142973544119, 4.637629094364569],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "国网能源电厂",
        "id": "16",
        "region": [113.54151786780794, 22.80380926245553, 113.54038648930938, 22.812717913617234, 113.54589327999828, 22.80982766004259, 113.54551956121014, 22.803620236400544],    //区域范围
        "center": [113.54384110087841, 22.805988899515423, 24.07766353426079],    //中心点
        "type": "jx",      //类型
    },

    {
        "name": "昌吉一线",
        "id": "17",
        "region": [113.54567772002606, 22.803608298981604, 113.54570526560626, 22.80988217505587, 113.54969212201014, 22.811666909009, 113.54948358477354, 22.802423836641385],    //区域范围
        "center": [113.54751992958181, 22.805140002373346, 2.3600184408125617],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌吉二线",
        "id": "18",
        "region": [113.54963676747373, 22.802433002287824, 113.54897027748018, 22.810134157625516, 113.55299972791893, 22.812057666202325, 113.55764775857436, 22.805562961956795, 113.55257588461133, 22.801814819082338],    //区域范围
        "center": [113.55316928015714, 22.80546220633305, 13.940619346345267],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌雅一线",
        "id": "19",
        "region": [113.55750137780036, 22.80586265918942, 113.55249482631224, 22.812707288973503, 113.56364497036036, 22.8254732297717, 113.56556342836879, 22.81151401353268],    //区域范围
        "center": [113.55864671621023, 22.81078628143312, 45.6525841996821],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌雅二线",
        "id": "20",
        "region": [113.56219136605459, 22.805223005713504, 113.56111364772286, 22.808596709413276, 113.56489244671867, 22.812046010763535, 113.57116651926816, 22.80927674693596],    //区域范围
        "center": [113.5660295586771, 22.807353875058034, 40.493010328602494],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌庭一线",
        "id": "21",
        "region": [113.56992735396683, 22.809071890644134, 113.57160508306352, 22.823378660762785, 113.58850737826978, 22.814877848811758, 113.59087288872699, 22.80206468231395],    //区域范围
        "center": [113.57800931201407, 22.810474377722944, 16.84655833680643],    //中心点
        "type": "jx",      //类型
    },

    {
        "name": "昌庭二线",
        "id": "22",
        "region": [113.521413844795, 22.788400244681796, 113.52457993987743, 22.796871641497987, 113.5291372964113, 22.796008105267077, 113.52651100547463, 22.78633446596129],    //区域范围
        "center": [113.52537156081995, 22.79207709658381, 22.06449921471873],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌联线",
        "id": "23",
        "region": [113.52149916715345, 22.804190709752458, 113.53105486221993, 22.809408637931735, 113.54082502946477, 22.807755993030703, 113.54108602543381, 22.803370015429685],    //区域范围
        "center": [113.53589526320945, 22.805772790173357, 0.679154952944805],    //中心点
        "type": "jx",      //类型
    },
    {
        "name": "昌满线",
        "id": "24",
        "region": [113.52504504889322, 22.79703793284703, 113.52880788229464, 22.8040053624483, 113.53271011814248, 22.803332794475846, 113.52893566635123, 22.796108277139368],    //区域范围
        "center": [113.52921733495529, 22.800116860285616, -1.5081470232585377],    //中心点
        "type": "jx",      //类型
    }
]