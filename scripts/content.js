(function(){
  const E=(id,title,trigger,duration,outcomes)=>({id,title,trigger,duration,outcomes});
  window.GSW_CONTENT={
    version:'10.3.0',
    events:[
      E(1,'打印机拒绝打印工作报告','老板把一张空白入职表推到你桌上。','3–4 分钟',[
        {id:'concise',label:'把报告精简到打印机愿意读',result:'打印机沉默了两秒，随后非常职业地吐出了入职表。',flags:{printer_friend:true},tone:'good'},
        {id:'reset',label:'恢复出厂设置',result:'它恢复了工作，但每次出纸都故意慢半拍。',flags:{printer_reset:true},tone:'odd'},
        {id:'unplug',label:'直接拔电源',result:'办公室灯一起灭了。黑暗里老板问：“你拔的是总排插？”',flags:{unplug_count:1},tone:'chaos'}]),
      E(2,'凌晨三点，楼上总有一颗玻璃珠','固定电话只响一声。客户第一句话是：“我不怕，我就是想睡觉。”','3–4 分钟',[
        {id:'felt',label:'给它铺一段软毡跑道',result:'玻璃珠照常运动，但楼下终于听不见了。',flags:{marble_padded:true},tone:'good'},
        {id:'day',label:'把每日运动改到下午',result:'客户睡着了。下午的邻居开始打电话。',flags:{marble_daytime:true},tone:'odd'},
        {id:'confiscate',label:'把玻璃珠没收',result:'问题立刻解决。第二天门口整齐出现三颗。',flags:{marble_confiscated:true},tone:'chaos'}]),
      E(3,'自动售货机拒绝服务老赵','门口站着一位气喘吁吁的大爷：“机器针对我。”','3–4 分钟',[
        {id:'apology',label:'让老赵正式向机器道歉',result:'售货机恢复营业，还多掉出一瓶水。',flags:{vending_friend:true},tone:'good'},
        {id:'sign',label:'贴一张“请勿拍打”',result:'双方都接受了这个非常像物业的解决方案。',flags:{vending_sign:true},tone:'odd'},
        {id:'power',label:'断电重启',result:'重新亮屏后，全场商品统一标价 9999。',flags:{unplug_count:1,vending_grudge:true},tone:'chaos'}]),
      E(4,'一只猫要求参加业主大会','物业来电：“它已经坐在业主席四十分钟了。”','4 分钟',[
        {id:'observer',label:'登记为“观察员”',result:'猫的一声“喵”被正式写入会议纪要：反对。',flags:{cat_respected:true,cat_signed:true},tone:'good'},
        {id:'box',label:'在门外设置纸箱席',result:'猫接受了，并在签到表上按了一个爪印。',flags:{cat_box_seat:true,cat_signed:true},tone:'odd'},
        {id:'carry',label:'强行抱走',result:'会议继续。门外所有流浪猫整齐坐成一排。',flags:{cat_offended:true},tone:'chaos'}]),
      E(5,'电梯新增了六楼半','物业发来一张建筑图：“图上没有，但电梯说有。”','5 分钟',[
        {id:'name',label:'给它贴正式“6½”门牌',result:'半层终于拥有能写在快递单上的地址。',flags:{half_floor_named:true},tone:'good'},
        {id:'merge',label:'并入六楼',result:'它接受了新编号，但电梯每次经过仍会停顿半秒。',flags:{half_floor_merged:true},tone:'odd'},
        {id:'close',label:'关闭停靠',result:'门不再打开。显示屏偶尔偷偷闪一下“6.5”。',flags:{half_floor_closed:true},tone:'chaos'}]),
      E(6,'共享单车集体罢工','平台运维员进门：“它们……把脚撑一起放下了。”','4–5 分钟',[
        {id:'parking',label:'重新规划坡顶停车点',result:'一半车被迁到坡顶，车铃集体响了一声，像表决通过。',flags:{bike_compromise:true},tone:'good'},
        {id:'shift',label:'安排运维轮班搬车',result:'平台很不情愿，但单车接受了。',flags:{bike_shift:true},tone:'odd'},
        {id:'force',label:'强制解锁',result:'可以骑了。你离开后，整条街车铃齐鸣十秒。',flags:{bike_forced:true},tone:'chaos'}]),
      E(7,'失物招领处收到一个星期二','地铁工作人员抱来一张日历纸：“系统里没有‘星期’这个分类。”','4–5 分钟',[
        {id:'return',label:'把星期二还给失主',result:'失主恢复了一整天记忆，然后想起那天开了四个会。',flags:{tuesday_returned:true},tone:'good'},
        {id:'store',label:'让失物处代管',result:'星期二被夹进档案柜，怪事屋日历偶尔跳过它。',flags:{tuesday_stored:true},tone:'odd'},
        {id:'comp',label:'改发一天补休',result:'你没有解决星期二，但成功解决了客户的心情。',flags:{tuesday_comp_off:true,rest_choice:1},tone:'chaos'}]),
      E(8,'所有门牌号都往后挪了一户','快递员冲进办公室：“我现在连自己在哪一户都不确定。”','4–5 分钟',[
        {id:'found',label:'改成“404（找得到）”',result:'404 终于停止移动，整栋楼恢复编号。',flags:{room404_found:true},tone:'good'},
        {id:'arrow',label:'给 404 加方向箭头',result:'它仍然叫 404，但再也没人说“找不到”。',flags:{room404_arrow:true},tone:'odd'},
        {id:'rename',label:'改成 405A',result:'问题技术上消失了。405 门牌开始不高兴。',flags:{room404_renamed:true},tone:'chaos'}]),
      E(9,'倒闭的早餐店每天仍营业十五分钟','新租户递来钥匙：“我只想装修，它每天比我先开门。”','5–6 分钟',[
        {id:'keep',label:'保留每天十五分钟',result:'新租户把开门时间改到 06:40。老人照常来。',flags:{breakfast_kept:true},tone:'good'},
        {id:'storeware',label:'把旧餐具完整收存',result:'自动营业停止，老人带走了那只一直为他准备的碗。',flags:{breakfast_closed_gently:true},tone:'odd'},
        {id:'share',label:'让新旧店一起营业',result:'老锅和新咖啡机第一次同时开工，彼此都很嫌弃。',flags:{breakfast_shared:true},tone:'good'}]),
      E(10,'客户收到自己明天寄来的快递','客户抱着箱子：“我怕把明天拆坏了。”','5 分钟',[
        {id:'loop',label:'照说明原样寄回',result:'时间循环稳定闭合，唯一争议变成邮费谁出。',flags:{parcel_loop_closed:true},tone:'good'},
        {id:'note',label:'加一张新便签再寄',result:'第二天收到一张回信：“谁让你加的。”',flags:{parcel_note_added:true},tone:'odd'},
        {id:'refuse',label:'拒绝寄出',result:'第二天出现两个完全一样的箱子，而且都运费到付。',flags:{parcel_broken:true},tone:'chaos'}]),
      E(11,'影子申请更换主人','一位上班族说：“它昨天在地铁站下班了。”','5–6 分钟',[
        {id:'rest',label:'每周安排一天慢走',result:'影子继续留下，并且第一次准时跟回家。',flags:{shadow_rest_day:true,rest_choice:1},tone:'good'},
        {id:'swap',label:'试行换主人一天',result:'退休老人很满意：“这个比我原来那个年轻。”',flags:{shadow_swap_trial:true},tone:'odd'},
        {id:'strict',label:'要求按原速度工作',result:'表面恢复正常。之后你自己的影子偶尔慢半拍。',flags:{shadow_strict:true},tone:'chaos'}]),
      E(12,'今天的雨只下一名客户','客户撑着第四把伞：“我明天要拍证件照。”','4–5 分钟',[
        {id:'apology',label:'正式撤回“有本事只下我一个”',result:'雨云停住，像确认了一遍，然后慢慢飘走。',flags:{rain_apology:true},tone:'good'},
        {id:'plant',label:'把雨转给阳台花盆',result:'云终于找到稳定工作，花长得特别快。',flags:{rain_reassigned:true},tone:'good'},
        {id:'fan',label:'用大风扇吹走',result:'短期有效。那朵云后来出现在屋顶远处。',flags:{rain_blown_away:true},tone:'chaos'}]),
      E(13,'公交车多出一个不存在的终点站','司机在车上给怪事屋打电话：“终点到了，但车说还没到。”','6–7 分钟',[
        {id:'name',label:'把回场路段命名为“下班”',result:'报站器郑重宣布：“下一站，下班。”所有人第一次鼓掌。',flags:{bus_after_terminal_named:true,rest_choice:1},tone:'good'},
        {id:'offservice',label:'终点后切换非运营状态',result:'公交接受了“这段路不载客，只下班”。',flags:{bus_offservice:true},tone:'good'},
        {id:'unplug',label:'拔掉报站器',result:'车终于停了。司机看着你：“这次真拔对了。”',flags:{unplug_count:1,bus_unplug_success:true},tone:'odd'}]),
      E(14,'鬼投诉民宿卫生太差','民宿老板：“真有鬼，但它一直给我打差评。”','5–6 分钟',[
        {id:'clean',label:'要求老板完整整改',result:'鬼复检后撤掉差评，改成“卫生有改善”。',flags:{ghost_review_fixed:true},tone:'good'},
        {id:'room',label:'给鬼换房',result:'鬼接受换房，并拿出一张更长的检查表。',flags:{ghost_room_changed:true},tone:'odd'},
        {id:'relax',label:'劝鬼别太较真',result:'怪事屋收到一星评价：“偏袒商家。”',flags:{ghost_bad_review:true},tone:'chaos'}]),
      E(15,'月亮涉嫌长期跟踪市民','客户递来一个月照片：“每张都有它。”','5–6 分钟',[
        {id:'report',label:'出具“非定向跟随说明”',result:'客户安心了。月亮没有意见。',flags:{moon_explained:true},tone:'good'},
        {id:'distance',label:'要求月亮保持 24 小时距离',result:'月亮当天挪到视野边缘，第二天恢复原位。',flags:{moon_warned:true},tone:'odd'},
        {id:'ignore',label:'建议客户少抬头',result:'老板评价：“技术上降低了投诉发生率。”',flags:{moon_ignore:true},tone:'chaos'}]),
      E(16,'以前处理过的怪事建立了群聊','办公室电脑自己进了一个群：“被处理过的对象互助群（不含人类）”。','6–7 分钟',[
        {id:'meet',label:'允许来办公室线下聚会',result:'群里立刻开始讨论谁负责带插线板。',flags:{weird_meetup_allowed:true},tone:'good'},
        {id:'online',label:'只允许线上交流',result:'群里出现了一长串省略号，但大家接受。',flags:{weird_online_only:true},tone:'odd'},
        {id:'mute',label:'把群聊静音',result:'电脑安静了。打印机开始代替群聊出纸。',flags:{group_muted:true},tone:'chaos'}]),
      E(17,'怪事屋委托怪事屋处理怪事屋','早上桌上多了一张委托单。委托人：怪事屋。','6–7 分钟',[
        {id:'normal',label:'登记为“正常范围内异常”',result:'办公室通过了自己的检查，非常满意。',flags:{office_normal_weird:true},tone:'good'},
        {id:'reform',label:'要求全面整改',result:'老板让你从打印机开始。打印机当场罢工。',flags:{office_reform_fail:true},tone:'chaos'},
        {id:'archive',label:'不予处理',result:'委托单自己爬进档案柜并完成归档。',flags:{office_self_archive:true},tone:'odd'}]),
      E(18,'老板被举报冒充老板','一位客户坚持：“上次那个老板比他高一点。”','6–7 分钟',[
        {id:'split',label:'本人经营，影子加班，照片管证件',result:'职责拆分后三位老板第一次达成一致。',flags:{boss_roles_split:true},tone:'good'},
        {id:'legal',label:'以营业执照为准',result:'本人获胜。影子在墙上明显垂了下来。',flags:{boss_legal_only:true},tone:'odd'},
        {id:'rotate',label:'三位轮班当老板',result:'当天办公室出现三套互相矛盾的通知。',flags:{boss_rotation:true},tone:'chaos'}]),
      E(19,'本街道临时增加星期八','街道办来电：“考勤系统没有这个字段。”','7–8 分钟',[
        {id:'rest',label:'定义为“补休试行日”',result:'大多数人欢呼。老板回屋后说：“别写进员工手册。”',flags:{day8_rest:true,rest_choice:1},tone:'good'},
        {id:'inventory',label:'定义为“盘点日”',result:'所有商店同时关门盘点，整条街突然很安静。',flags:{day8_inventory:true},tone:'odd'},
        {id:'lostfound',label:'交给失物招领处',result:'星期八被贴上标签：“日期类，临时。”',flags:{day8_lostfound:true},tone:'good'}]),
      E(20,'怪事屋申请登记为怪事','异常事物登记处寄来一张长得能拖到地上的表。','8–10 分钟',[
        {id:'register',label:'登记为“经营性怪事”',result:'怪事屋得到正式编号。牌照挂上去以后，招牌明显更精神。',flags:{ending_registered:true},tone:'good'},
        {id:'deny',label:'坚持是普通事务所',result:'登记处备注：“自我认知存在争议。”',flags:{ending_denied:true},tone:'odd'},
        {id:'pending',label:'材料不齐，下次再说',result:'老板点头：“这最符合我们的实际情况。”电话立刻又响了。',flags:{ending_pending:true},tone:'good'}])
    ],
    achievements:[
      ['first','普通','入职成功','完成事件 01'],['ten','普通','见怪不怪','完成 10 件事件'],['all','普通','怪事屋优秀员工','完成全部 20 件事件'],
      ['nonhuman','普通','非人类客服','友好处理至少 5 个非人类对象'],['field','普通','外勤熟练','完成 5 件外勤事件'],['breakfast','普通','照常营业','保留早餐店每天十五分钟'],
      ['moon','普通','天体调解员','完成月亮事件'],['registered','普通','经营性怪事','让怪事屋正式登记'],
      ['repair','冷幽默','专业维修','累计三次拔电源，并在公交事件终于拔对一次'],['process','冷幽默','流程完整','让猫完成签到手续'],['found404','冷幽默','404 Found','保留 404 编号并解决门牌问题'],
      ['future','冷幽默','给未来添乱','给时间快递加入新便签'],['hr','冷幽默','人事思维','用补休处理丢失星期二'],['overkill','冷幽默','执法过度','没收玻璃珠'],
      ['badreview','冷幽默','差评处理失败','让鬼给怪事屋打一星'],['mute','冷幽默','已读不回','把怪事群聊静音'],['day8','冷幽默','周八愉快','把星期八定义为补休日'],
      ['pending','冷幽默','材料不齐','最终选择下次再登记'],
      ['chair','隐藏','领导看不见','累计转老板椅 5 次'],['fridge','隐藏','冰箱监察员','连续 5 次回办公室先开冰箱'],['remembers','隐藏','它记得你','早期对象在后期主动帮你一次'],
      ['rest','隐藏','今天不想上班','三个不同事件优先选择休息/下班导向方案'],['literal','隐藏','字面意义','三次把角色随口说的话按字面执行'],['catfriend','隐藏','猫的朋友','猫在事件 8 与 16 都主动帮你'],
      ['observer','隐藏','办公室观察员','事件 17 在自查提示出现前找到至少 5 个异常'],['nothing','隐藏','什么也没解决','让各方接受但异常本身仍然存在']
    ].map(([id,type,name,desc])=>({id,type,name,desc}))
  };
})();
