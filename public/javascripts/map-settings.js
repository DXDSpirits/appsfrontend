(function() {
    var APIRoot = 'http://apps.wedfairy.com/api/';

    var MapSettingsView =  Backbone.View.extend({
        events: {
            'click .map-wrapper .btn-tips-map': 'useBaiduMap',
            'click .header-navbar .btn-save': 'saveData',
            'click [data-route]': 'routeTo',
            'input #map-location': 'enableSaveBtn'
        },
        el: $('#map-settings-wrapper'),
        initialize: function() {
            this.mapID = location.href.match(/map\/(\d+)\/settings/)[1];
            this.token = location.href.match(/\?token=(\w+)/)[1];

            this.mapModel =  new (Backbone.Model.extend({
                // url: APIRoot+ 'maps/map/' + this.mapID
            }))();

            this.getMapData();
            this.setImgPosition();

        },
        enableSaveBtn: function() {
            var location = this.$('#map-location').val();
            if(location && localStorage.getItem("map_lng") && localStorage.getItem("map_lat")) {
                this.$('.btn-save').removeClass('hidden');
            }else {
                this.$('.btn-save').addClass('hidden');
            }
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            }
        },
        useBaiduMap: function(){
            // 首先保存数据到 localStorage
            localStorage.setItem("map_location", $("#map-location").val());
            localStorage.setItem("map_message", $("#map-message").val());

            //跳转到地图标注页面
            window.location.href = encodeURI('/map/mark/');
        },
        saveData: function() {
            var location = $("#map-location").val();
            var message = $("#map-message").val();
            var address = localStorage.getItem("map_address");

            var map_lng = localStorage.getItem("map_lng") || 116.331398;
            var map_lat = localStorage.getItem("map_lat") || 39.897445;

            if(!address || !map_lat || !map_lng) {
                alert('出错了！请重新定位试试...');
                return;
            }
            //删除 localStorage
            localStorage.removeItem("map_location");
            localStorage.removeItem("map_address");
            localStorage.removeItem("map_message");
            localStorage.removeItem("map_lng");
            localStorage.removeItem("map_lat");
            //提交数据到 api
            var self = this;
            // this.mapModel.save({
            //     // url: APIRoot+ 'maps/map/' + this.mapID + "/?token=" + this.token,
            //     data: {
            //         "location":location,
            //         "address":address,
            //         "message":message,
            //         "map_lng":map_lng,
            //         "map_lat":map_lat
            //     },
            //     success: function (data) {
            //         history.back();
            //     },
            //     error: function (e) {
            //         console.log(e);
            //         alert("请填写正确的地址并使用百度地图哟！");
            //     }
            // })
            $.ajax({
                url: APIRoot+ 'maps/map/' + this.mapID + "/?token=" + this.token,
                type: "PUT",
                data: {
                    "location":location,
                    "address": address,
                    "message":message,
                    "map_lng":map_lng,
                    "map_lat":map_lat
                },
                success: function (data) {
                    alert('保存成功！');
                    // history.back();
                },
                error: function (e) {
                    alert("请填写地址并点击「定位地点」哟！");
                }
            });
        },
        map_marker_display: function(){
            //根据地图图片高度计算标注的 top
            $('.map-marker').removeClass('hidden');
        },
        getMapData: function() {
            //获取地图数据
            var self = this;
            if (!localStorage.getItem("map_location")  && !localStorage.getItem("map_message")) {
                //localStorage 不存在，从 api 获取数据
                $.ajax({
                    url: APIRoot + "maps/map/" + self.mapID,
                    type: "GET",
                    success: function (data) {
                        if(!data.location && !data.address){
                            //没有数据，这是新建应用，设置默认值
                            self.$("#map-location").val('');
                            // $("#map-address").val("具体的地址，XX省XX市XX区XX路XX号");
                            var message = data.message || ''
                            self.$("#map-message").val(message);
                        }else{
                            self.$("#map-location").val(data.location);
                            // $("#map-address").val(data.address);
                            self.$("#map-message").val(data.message);
                        }
                        localStorage.setItem('map_address', data.address);
                    }
                });
            }
            else {
                //localStorage 存在，证明用户点击过「使用百度地图」按钮，那么从 localStorage 里读取数据
                this.$("#map-location").val(localStorage.getItem("map_location"));
                // this.$("#map-address").val(localStorage.getItem("map_address"));
                this.$("#map-message").val(localStorage.getItem("map_message"));
            }
            if(this.$('#map-location').val()) {
                this.enableSaveBtn();
            }
        },
        setImgPosition: function() {
        //填写地图图片地址
            if (!localStorage.getItem("map_lng") && !localStorage.getItem("map_lat")) {
                //localStorage 不存在，从 api 获取数据
                var self = this;
                var model = new (Backbone.Model.extend({
                    urlRoot: APIRoot + "rsvps/rsvp/" + this.rsvpID,
                }))();
                $.ajax({
                    url: APIRoot + "maps/map/" +  + self.mapID,
                    type: "GET",
                    success: function (data) {
                        if (data.map_lng == null && data.map_lat == null) {
                            //api 没有坐标数据，证明用户第一次设置
                            localStorage.setItem("map_lng",116.331398);
                            localStorage.setItem("map_lat",39.897445);
                            // $(".map-img").attr("src", "../images/map_img.jpg");
                            $(".map-img").attr("src", "/public/images/map_img.jpg");
                        }
                        else {
                            //api 里面有数据
                            var map_lng = data.map_lng;
                            var map_lat = data.map_lat;
                            localStorage.setItem("map_lng",map_lng);
                            localStorage.setItem("map_lat",map_lat);
                            $(".map-img").attr("src","http://api.map.baidu.com/staticimage?center=" + map_lng + "," + map_lat + "&width=360&height=360&zoom=16");
                            self.map_marker_display();
                        }
                    }
                });
            }
            else {
                //localStorage 存在，证明用户重新设置过坐标，那么从 localStorage 里读取数据
                var map_lng = localStorage.getItem("map_lng");
                var map_lat = localStorage.getItem("map_lat");
                $(".map-img").attr("src","http://api.map.baidu.com/staticimage?center=" + map_lng + "," + map_lat + "&width=360&height=360&zoom=16");
                this.map_marker_display();
            }
        }
    });
    var mapSetting = new MapSettingsView();
})(jQuery);
