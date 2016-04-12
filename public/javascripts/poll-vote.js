(function() {
    var APIRoot = 'http://apps.wedfairy.com/api/';
    var VUAPIRoot = 'http://api.wedfairy.com/api/users/user/';

    var pollCollection = new Amour.Collection();

    var voteTotalNum = 0;

    //polls collection view
    var PollResultCollectionView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'poll-item',
            template: $('#template-dashboard-poll-item').html(),
            serializeData: function() {
                var data = Amour.ModelView.prototype.serializeData.call(this);
                data.percent = (Math.round(data.count / voteTotalNum * 10000)/100).toFixed(2);
                return data;
            }
        })
    });

    //poll collection view
    var PollRadioCollectionView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'dashboard-poll-item',
            template: $('#template-vote-radio-item').html(),
        })
    });

    //checkbox collection view
    var PollCheckboxCollectionView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'dashboard-poll-item',
            template: $('#template-vote-checkbox-item').html(),
        })
    });

    var PollVoteView = Amour.View.extend({
        events: {
            'click [data-route]': 'routeTo',
            'click .btn-save[enable=true]': 'submitPoll',
            'change input': 'inputListener'
        },
        el: $('#poll-vote-wrapper'),
        initialize: function() {
            // 默认可以投票
            this.poll_vote_disable = 0

            this.pollID = location.href.match(/poll\/(\d+)/)[1];
            this.token = location.href.match(/\?token=(\w+)/)[1];

            // 投票结果
            this.polls = new (Amour.Collection.extend({
                url: APIRoot + "polls/poll/" + this.pollID + '/poll_options/?token=' + this.token,
                model: Amour.Model
            }))();

            this.pollResultCollectionView = new PollResultCollectionView({
                collection: this.polls,
                el: this.$('.poll-result-wrapper')
            });

            //单选的collection
            this.pollRadioDataCollection = new (Amour.Collection.extend({
                url: APIRoot + "polls/poll/" + this.pollID + "/poll_options/",
                model: Amour.Model,
            }))();
            this.pollCollectionView = new PollRadioCollectionView({
                collection: this.pollRadioDataCollection,
                el: this.$('.poll-items-wrapper')
            });

            //复选的collection
            this.pollCheckboxDataCollection = new (Amour.Collection.extend({
                url: APIRoot + "polls/poll/" + this.pollID + "/poll_options/",
                model: Amour.Model,
            }))();

            this.pollCollectionView = new PollCheckboxCollectionView({
                collection: this.pollCheckboxDataCollection,
                el: this.$('.poll-items-wrapper')
            });
            this.pollDataFetch();
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                self.history.back();
            }
        },
        inputListener: function() {
            if(this.$('input:checked').length) {
                this.$('.btn-save').attr('enable', 'true');
            }else {
                this.$('.btn-save').attr('enable', 'false');
            }
        },
        pollDataFetch: function() {
            var self = this;
            var pollInfoModel = new Backbone.Model();
            pollInfoModel.fetch({
                url: APIRoot + "polls/poll/" + this.pollID,
                success: function(model) {
                    voteTotalNum = model.get('count');
                    self.$('.poll-title').html(model.get('title'));
                    self.$(".poll-message").html(return2br(model.get('message')));
                    self.$(".poll-deadline-text").html(model.get('deadline'));
                    if(Date.parse(model.get('deadline')) < Date.parse(moment().format('YYYY-MM-DD'))) {
                        // 投票过期
                        this.poll_vote_disable = 1;
                        self.$('input').attr('readonly', 'true');
                        self.$('btn-save').addClass('hidden');
                        self.$(".dashboard-total-num").removeClass('hidden');
                    }else {
                        sessionStorage.setItem("poll_type", model.get('type'));
                    }
                    self.fetchUserInfo();
                }
            });
        },
        radioOptionsFetch: function() {
            var self = this;
            this.pollRadioDataCollection.fetch({
                success: function(collection) {}
            });
        },
        checkboxOptionsFetch: function() {
            var self = this;
            this.pollCheckboxDataCollection.fetch({
                success: function(collection) {}
            });
        },
        fetchUserInfo: function() {
            var self = this;
            var user = new (Backbone.Model.extend({
                urlRoot: VUAPIRoot,
            }))();
            user.fetch({
                headers: {'Authorization': 'Token ' + this.token},
                success: function(data) {
                    sessionStorage.setItem("poll_user", data.get(0).id);
                    if(data.get(0).profile.avatar == null || data.get(0).profile.avatar == ""){
                        sessionStorage.setItem("poll_avatar", "http://up.img.8yinhe.cn/o_19vdmapepac610dm1kgdedj1tlj7.png?imageView2/2/w/1280/q/85");
                    }else{
                        sessionStorage.setItem("poll_avatar", data.get(0).profile.avatar);
                    }
                    if(data.get(0).profile.name == null || data.get(0).profile.name == ""){
                        sessionStorage.setItem("poll_name", "某神秘用户");
                    }else{
                        sessionStorage.setItem("poll_name", data.get(0).profile.name);
                    }

                    //本地验证投票用户唯一性
                    if(localStorage.getItem("poll_" + self.pollID + "_voted") == data.get(0).id){
                        self.poll_vote_disable = 1;
                        self.showPollResult();
                    }else{
                        //api 验证投票用户唯一性
                        self.verifyVoted();
                    }
                },
                error: function(e) {
                    sessionStorage.setItem("poll_avatar", null);
                    self.saveData();
                }
            })
        },
        verifyVoted: function() {
            var self = this;
            var votedModel = new Backbone.Model();
            votedModel.fetch({
                url: APIRoot + "polls/poll/" + self.pollID + "/voted/" + sessionStorage.getItem("poll_user") + "/",
                success: function (data) {
                    if(!_.isEmpty(data.toJSON())){
                        // 投票记录里有搜索到该用户
                        self.poll_vote_disable = 1;
                    }
                    // 在这里确定到底是渲染选项卡还是投票结果
                    if(self.poll_vote_disable == 1){
                        self.$(".dashboard-total-num").removeClass('hidden');
                        self.showPollResult();
                    }else{
                        if(sessionStorage.getItem("poll_type") == 1) {
                            // 单选
                            self.radioOptionsFetch();
                        }else if(sessionStorage.getItem("poll_type") == 0) {
                            // 多选
                            self.checkboxOptionsFetch();
                        }
                    }
                },
                error: function () {
                    alert("呜呼 ಥ_ಥ ，投票的人太多啦，小盒子建议你请稍后再试。");
                }
            });

        },
        showPollResult: function(){
            // 隐藏 form，显示投票结果
            this.$('.footer-navbar').addClass('hidden');
            this.$('.poll-result-wrapper').removeClass('hidden');
            self.$(".dashboard-total-num").children(".text-default-color").text(voteTotalNum);
            this.polls.fetch();
        },
        submitPoll: function(){
            if(+sessionStorage.getItem("poll_type")){
                // 单选
                this.saveRadioOptions();
            }else{
                this.saveCheckboxOptions();
            }
        },
        saveRadioOptions: function() {
            //post 单选
            var self = this;
            var option = $(":radio[name='radio-input']:checked").val();
            var user_id = sessionStorage.getItem("poll_user");
            var avatar = sessionStorage.getItem("poll_avatar");
            var name = sessionStorage.getItem("poll_name");
            var model = new Amour.Model({
                poll: this.pollID,
                option: option,
                user_id: user_id,
                avatar: avatar,
                name: name
            });
            model.save({}, {
                url: APIRoot + "polls/vote/",
                success: function () {
                    localStorage.setItem("poll_" + self.pollID + "_voted", sessionStorage.getItem("poll_user"));
                    alert("投票成功，小盒子谢谢您的参与！");
                    window.location.reload();
                },
                error: function () {
                    alert("呜呼 ಥ_ಥ ，投票的人太多啦，小盒子建议你请稍后再试。");
                }
            })
        },
        saveCheckboxOptions: function(){
            //post 多选
            var self = this;
            var n = this.$(':checked[name=checkbox-input]').length;

            _.each(this.$(":checked[name='checkbox-input']"), function(item) {
                var option = $(item).val();
                var user_id = sessionStorage.getItem("poll_user");
                var avatar = sessionStorage.getItem("poll_avatar");
                var name = sessionStorage.getItem("poll_name");

                var model = new Amour.Model({
                    poll: self.pollID,
                    option: option,
                    user_id: user_id,
                    avatar: avatar,
                    name: name
                });

                model.save({}, {
                    url: APIRoot + "polls/vote/",
                    success: function () {
                        n -= 1;
                        if(!n) {
                            localStorage.setItem("poll_" + self.pollID + "_voted", sessionStorage.getItem("poll_user"));
                            alert("投票成功，小盒子谢谢您的参与！");
                            window.location.reload();
                        }
                    },
                    error: function () {
                        alert("呜呼 ಥ_ಥ ，投票的人太多啦，小盒子建议你请稍后再试。");
                    }
                })
            })
        },
    })
    var pollVoteView = new PollVoteView();
})(jQuery);