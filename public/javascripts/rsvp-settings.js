(function() {

    var APIRoot = 'http://apps.wedfairy.com/api/';

    var RsvpDashboardView = Backbone.View.extend({
        events: {
            'click .btn-save[enable=true]': 'rsvpSettingsSubmit',
            'click .header-navbar .btn-show-dashboard': 'showDashboard',
            'click [data-route]': 'routeTo',
            'input input': 'inputListener'
        },
        el: $('#rsvp-settings-wrapper'),
        initialize: function() {
            this.rsvpID = location.href.match(/rsvp\/(\d+)\/settings/)[1];
            this.token = location.href.match(/\?token=(\w+)/)[1];
            this.rsvpFetch();
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            }
        },
        inputListener: function() {
            if(this.$('#rsvp-deadline').val()) {
                this.$('.btn-save').attr('enable', 'true');
            }else {
                this.$('.btn-save').attr('enable', 'false');
            }
        },
        //「提交」按钮点击事件
        rsvpSettingsSubmit: function(){
            var message = $("#rsvp-message").val();
            var deadline = $("#rsvp-deadline").val();

            var model = new Backbone.Model({
                "id": this.rsvpID,
                "message": message,
                "deadline": deadline
            });
            model.save({}, {
                url: APIRoot + "rsvps/rsvp/" + this.rsvpID + "/?token=" + this.token,
                success: function(data) {
                    alert('保存成功');
                    // history.back();
                },
                error: function(e) {
                    console.log(e);
                }
            })
        },
        showDashboard: function(){
            var url = "/rsvp/" + this.rsvpID + "/dashboard/?token=" + this.token;
            window.location.href = encodeURI(url);
        },
        rsvpFetch: function() {
            //从 api 中读取数据
            var self = this;
            var model = new (Backbone.Model.extend({
                urlRoot: APIRoot + "rsvps/rsvp/" + this.rsvpID,
            }))();
            model.fetch({
                success: function (data) {
                    if(data.get('message') == null && data.get('deadline') == null){
                        //没有数据，这是新建应用，设置默认值
                        self.$("#rsvp-message").val("在这花好月圆、和风丽日的美好日子，真诚邀请您来参加我们的婚礼。婚礼将按期准时举行，恭候各位的佳音！");
                        self.$("#rsvp-deadline").val(moment().add(1, 'months').format('YYYY-MM-DD'));
                        self.$('.btn-save').attr('enable', 'true');
                    }else{
                        self.$("#rsvp-message").val(data.get('message'));
                        self.$("#rsvp-deadline").val(data.get('deadline'));
                        self.$('.btn-save').attr('enable', 'true');
                    }
                }
            })
        }
    })
    var rsvpDashboard = new RsvpDashboardView();

})(jQuery);