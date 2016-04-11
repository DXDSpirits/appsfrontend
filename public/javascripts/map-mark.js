(function() {
    var MapMarkView = Backbone.View.extend({
        events: {
            'click .map-mark-sure': 'updateMap',
            'click .header-navbar .btn-save': 'saveData',
            'click [data-route]': 'routeTo',
            'input #map-address': 'enableSaveBtn'
        },
        el: $('#map-mark-wrapper'),
        initialize: function() {
            //根据屏幕高度计算地图高度
            var self = this;
            var h = $(window).height();
            var w = $(window).width()
            // 计算map-marker的位置
            this.$("#baidu-map-mark").css("height", w - 30 + 'px');
            this.$('.map-mark-marker').css('top', w / 2 + 44 + 'px');
            //创建地图实例
            var point = new BMap.Point(116.331398, 39.897445);
            this.map = new BMap.Map("baidu-map-mark");
            this.map.centerAndZoom(point, 12);
            //将地址解析结果显示在地图上,并调整地图视野
            this.myGeo = new BMap.Geocoder();

            //从 localStorage 中获取地址
            this.address = localStorage.getItem("map_address");

            if(!this.address || this.address == 'undefined' || this.address == 'null') {
                this.locaitonInBMap(this.address);
                this.$('#map-address').val('');
            }else {
                this.$('#map-address').val(this.address);
                this.locaitonInBMap(this.address);
                this.enableSaveBtn();
            }
        },
        updateMap: function() {
            var addressValue = this.$('#map-address').val();
            if(addressValue) {
                this.locaitonInBMap(addressValue);
            }else {
                alert('请输入详细地址！');
            }
        },
        locaitonInBMap: function(currentPosition) {
            var self = this;
            this.myGeo.getPoint(String(currentPosition), function (somePoint) {
                if (somePoint) {
                    self.map.centerAndZoom(somePoint, 16);
                    localStorage.setItem('map_address', currentPosition);
                } else {
                    self.map.centerAndZoom('北京市', 11);
                    alert('请输入正确详细地址，点击"确定"按钮！');
                }
            }, "北京市");
        },
        enableSaveBtn: function() {
            var location = this.$('#map-address').val();
            if(location) {
                this.$('.btn-save').removeClass('hidden');
            }else {
                this.$('.btn-save').addClass('hidden');
            }
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            } else if (route == 'preview') {
                App.previewStory(App.story.get('name'));
            } else {
                App.router.navigate(route);
            }
        },
        saveData: function() {
            //保存坐标到 localStorage
            localStorage.setItem("map_lng", this.map.getCenter().lng);
            localStorage.setItem("map_lat", this.map.getCenter().lat);
            //返回到地图设置页面
            history.back();
        }
    })
    var mapMark = new MapMarkView();

})(jQuery);