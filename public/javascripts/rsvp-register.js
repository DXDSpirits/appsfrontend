(function() {

    var APIRoot = 'http://apps.wedfairy.com/api/';
    var VUAPIRoot = 'http://api.wedfairy.com/api/users/user/';

    var RsvpRegisterView = Amour.View.extend({
        events: {
            'click .btn-save[enable=true]': 'rsvpSubmit',
            'click [data-route]': 'routeTo',
            'input input': 'inputListener'
        },
        el: $('#rsvp-register-wrapper'),
        initialize: function() {
            this.rsvpID = location.href.match(/rsvp\/(\d+)/)[1];
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
            if(this.$('#rsvp-name').val() && this.$('#rsvp-people').val() && this.$('#rsvp-mobile').val()) {
                this.$('.btn-save').attr('enable', 'true');
            }else {
                this.$('.btn-save').attr('enable', 'false');
            }
        },
        //「提交」按钮点击事件
        rsvpSubmit: function(){
            var self = this;
            //先验证用户输入的数据是否合法
            if(this.$("#rsvp-name").val().length == 0){
                alert("记得填写姓名哟！");
                return false;
            }
            if(this.$("#rsvp-name").val().length > 20 ){
                alert("姓名太长啦！建议用真实姓名或是故事主人可以识别的昵称哟。");
                return false;
            }
            if(this.$("#rsvp-mobile").val().length == 0){
                alert("记得填写电话哟！");
                return false;
            }
            if(!isMobile(this.$("#rsvp-mobile").val())){
                alert("亲，请填写正确的电话号码，手机号、固话都可以哟。");
                return false;
            }
            if(this.$("#rsvp-people").val().length == 0){
                alert("记得填写参加人数哟！");
                return false;
            }
            if(!isPeople(this.$("#rsvp-people").val())){
                alert("参加人数必须是在 1一999 之间的整数哟。");
                return false;
            }

            var user = new (Backbone.Model.extend({
                urlRoot: VUAPIRoot,
            }))();
            user.fetch({
                headers: {'Authorization' :'Token ' + this.token},
                success: function(data) {
                    sessionStorage.setItem("rsvp_avatar", data.get(0).profile.avatar);
                    self.saveData();
                },
                error: function(e) {
                    sessionStorage.setItem("rsvp_avatar", null);
                    self.saveData();
                }
            })
        },
        saveData: function(){
            //会话结束后 sessionStorage 将自动清理 暂无法限制宾客的唯一性，既同一用户可以多次提交
            var avatar = sessionStorage.getItem("rsvp_avatar") || null;
            var name = $("#rsvp-name").val();
            var people = $("#rsvp-people").val();
            var mobile = $("#rsvp-mobile").val();

            var model = new Amour.Model({
                rsvp: this.rsvpID,
                avatar: avatar,
                name: name,
                people: people,
                mobile: mobile
            });
            model.save({}, {
                url: APIRoot + "rsvps/guest/",
                success: function(data) {
                    history.back();
                },
                error: function(e) {
                    console.log(e);
                }
            })
        },
        rsvpFetch: function() {
            //从 api 中读取数据
            var self = this;
            var model = new (Backbone.Model.extend({
                urlRoot: APIRoot + "rsvps/rsvp/" + this.rsvpID,
            }))();
            model.fetch({
                success: function (data) {
                    //获取数据插入页面
                    self.$(".deadline").text(data.get('deadline'));
                    self.$(".rsvp-rsvp-message").html(return2br(data.get('message')));
                    if(Date.parse(data.get('deadline')) < Date.parse(moment().format('YYYY-MM-DD'))){
                        //隐藏 form，显示提示信息
                        // $("form").slideUp("slow");
                        self.$('.form-register').addClass('hidden');
                        self.$('.footer-navbar').addClass('hidden');
                        self.$(".rsvp-rsvp-notice").removeClass('hidden').show();
                    }
                }
            })
        }
    });

    var rsvpRegister = new RsvpRegisterView();


})(jQuery);