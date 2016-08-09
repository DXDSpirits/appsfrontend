(function() {
    var APIRoot = '/api/';

    var MapShowView = Backbone.View.extend({
        events: {
            'click [data-route]': 'routeTo',
            'click .map-show-route': 'map_show_route'
        },
        el: $('#map-show-wrapper'),
        initialize: function() {
            var mapID = location.href.match(/map\/(\d+)/)[1];
            //根据地图宽度计算地图高度
            $("#baidu-map").css("height",$("#baidu-map").width() + "px");
            //读取地图数据
            $.ajax({
                url: APIRoot + "maps/map/" + mapID,
                type: "GET",
                success: function (data) {
                    sessionStorage.setItem("map_address",data.address);
                    $(".map-show-location").html(return2br(data.location));
                    $(".map-show-address").html(return2br(data.address));
                    $(".map-show-message").html(return2br(data.message));
                    //创建地图实例
                    var map = new BMap.Map("baidu-map");
                    var point = new BMap.Point(data.map_lng,data.map_lat);
                    map.centerAndZoom(point,15);
                    //禁止地图拖拽
                    map.disableDragging();
                    //创建地图标注
                    var marker = new BMap.Marker(point);
                    //将标注添加到地图中
                    map.addOverlay(marker);
                    //创建信息窗口
                    var opts = {width:400,height:70,title:data.location};
                    var infoWindow = new BMap.InfoWindow(data.address,opts);
                    marker.addEventListener("click", function(){
                        map.openInfoWindow(infoWindow,point); //开启信息窗口
                    });
                    //根据浏览器定位客户端地址
                    var geolocation = new BMap.Geolocation();
                    geolocation.getCurrentPosition(function(r){
                        if(this.getStatus() == BMAP_STATUS_SUCCESS){
                            var local = new BMap.Point(r.point.lng,r.point.lat);
                            var geoc = new BMap.Geocoder();
                            geoc.getLocation(local, function(rs){
                                var addComp = rs.addressComponents;
                                var address = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                                //保存客户端地址到 sessionStorage
                                sessionStorage.setItem("client_address",address);
                            });
                        }else{
                            alert('failed'+this.getStatus());
                        }
                    },{enableHighAccuracy:true})
                }
            });
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            }
        },
        //「点击查看路线」按钮点击事件
        map_show_route: function(){
            /*start|end：（必选）
             {name:string,latlng:Lnglat}
             opts:
             mode：导航模式，固定为
             BMAP_MODE_TRANSIT、BMAP_MODE_DRIVING、
             BMAP_MODE_WALKING、BMAP_MODE_NAVIGATION
             分别表示公交、驾车、步行和导航，（必选）
             region：城市名或县名  当给定region时，认为起点和终点都在同一城市，除非单独给定起点或终点的城市
             origin_region/destination_region：同上
             */
            var start = {name:sessionStorage.getItem("client_address")}
            var end = {name:sessionStorage.getItem("map_address")}
            var opts = {mode:BMAP_MODE_DRIVING,region:"北京"}
            var ss = new BMap.RouteSearch();
            ss.routeCall(start,end,opts);
            //不需要清除 sessionStorage，会话结束后自动清除
        }
    })
    var mapShow = new MapShowView();

})(jQuery);