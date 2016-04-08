(function() {

    var APIRoot = 'http://apps.wedfairy.com/api/';

    var RsvpDashboardView = Backbone.View.extend({
        events: {
            'click .rsvp-submit': 'rsvpSettingsSubmit',
            'click .header-navbar .btn-show-dashboard': 'showDashboard',
            'click [data-route]': 'routeTo'
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
                    history.back();
                },
                error: function(e) {
                    console.log(e);
                }
            })
        },
        showDashboard: function(){
            var url = "/rsvp/" + this.rsvpID + "/dashboard/?token=" + this.token;
            console.log(url);
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
                    if(data.message == null && data.deadline == null){
                        //没有数据，这是新建应用，设置默认值
                        self.$("#rsvp-message").val("在这花好月圆、良辰美景之夜，真诚邀请您来参加我们的婚礼。婚礼将于 2015 年 10 月 1 日在王府大酒店举办，恭候各位的佳音！");
                        self.$("#rsvp-deadline").val(moment().add(1, 'months').format('YYYY-MM-DD'));
                    }else{
                        self.$("#rsvp-message").val(data.message);
                        self.$("#rsvp-deadline").val(data.deadline);
                    }
                }
            })
        }
    })
    var rsvpDashboard = new RsvpDashboardView();

})(jQuery);