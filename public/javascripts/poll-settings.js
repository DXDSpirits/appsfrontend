(function() {
    var APIRoot = 'http://apps.wedfairy.com/api/';
    var pollCollection = new Amour.Collection();

    //poll collection view
    var PollCollectionView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'input-group input-group-lg poll-item',
            template: $('#template-poll-option-item').html(),
        }),
        initCollectionView: function() {
            this.listenTo(this.collection, 'all', this.updateIndexes);
        },
        updateIndexes: function() {
            this.$('.poll-item').each(function(index, content) {
                $(this).find('.index').text('选项' + (index + 1));
            });
        }
    });

    var PollSettingsView = Amour.View.extend({
        events: {
            'click .btn-goto-dashboard': 'gotoDashboard',
            'click [data-route]': 'routeTo',
            'click .btn-add-poll-option': 'addBlankOptiop',
            'click .btn-save': 'savePollData',
            'input input': 'inputListener'
        },
        el: $('#poll-settings-wrapper'),
        initialize: function() {
            this.pollID = location.href.match(/poll\/(\d+)\/settings/)[1];
            this.token = location.href.match(/\?token=(\w+)/)[1];

            this.pollDataCollection = new (Amour.Collection.extend({
                url: APIRoot + "polls/poll/" + this.pollID + "/poll_options/",
                model: Amour.Model,
            }))();
            this.pollCollectionView = new PollCollectionView({
                collection: this.pollDataCollection,
                el: this.$('.poll-option-list')
            });
            this.pollDataFetch();
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            }
        },
        gotoDashboard: function(){
            var url = "/poll/" + this.pollID + "/dashboard/?token=" + this.token;
            window.location.href = encodeURI(url);
        },
        inputListener: function() {
            if(this.$('#poll-title').val() && this.$('input[data-pos=0]').val() && this.$('input[data-pos=1]').val()) {
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
                    self.$('#poll-title').val(model.get('title'));
                    self.$("#poll-message").val(return2br(model.get('message')));
                    self.$("#poll-deadline").val(model.get('deadline'));
                    self.$("#poll-type").val(model.get('type'));
                }
            })
            this.pollDataCollection.fetch({
                success: function(collection) {
                    self.$('#poll-title').val(collection.get('title'));
                    self.$('#poll-message').val(collection.get('message'));
                    if(collection.models.length) {
                        // 如果有投票设置
                        self.$('.btn-save').attr('enable', 'true');
                        self.$('input[name=poll-name]').attr('readonly', 'true');
                        self.$('.poll-option-add').addClass('hidden');
                        self.$('select').attr('disabled', 'disabled');
                    }else {
                        // 如果新建投票第一次设置， 新建2个空白选项
                        localStorage.setItem('set_data', 0);
                        self.$("#poll-deadline").val(moment().add(1, 'months').format('YYYY-MM-DD'));
                        self.addBlankOptiop();
                        self.addBlankOptiop();
                    }
                }
            });
        },
        addBlankOptiop: function() {
            var currentOptionNum = this.$('.poll-item').length || 0;
            currentOptionNum += 1;
            this.pollDataCollection.add({
                poll: this.pollID,
                pos: currentOptionNum,
                content: ''
            });
            this.render;
        },
        //「提交」按钮点击事件
        savePollData: function(){
            var title = this.$("#poll-title").val();
            var message = this.$("#poll-message").val();
            var deadline = this.$("#poll-deadline").val();
            var type = this.$("#poll-type").val();

            var pollModel = new Backbone.Model({
                id: this.pollID,
                title: title,
                message: message,
                deadline: deadline,
                type: type
            });
            pollModel.save({}, {
                url: APIRoot + "polls/poll/" + this.pollID + "/?token=" + this.token,
                success: function(data) {
                    history.back();
                },
                error: function(e) {
                }
            });
            if(localStorage.getItem('set_data') == 0) {
                this.savePollOptions();
            }
        },
        savePollOptions: function(){
            var self = this;
            var num = this.$('.poll-option-list .poll-item').length;
            _.each(this.$('.poll-option-list .poll-item'), function(item, index) {
                var content = $(item).find('input[name=poll-name]').val();
                var model = new Amour.Model({
                    "poll": self.pollID,
                    "pos": index,
                    "content": content
                });
                model.save({}, {
                    url: APIRoot + "polls/option/",
                    success: function () {
                        num--;
                        history.back();
                    }
                });
            });
            if(!num) {
                localStorage.removeItem('set_data');
            }
        },

    })
    var pollSettingsView = new PollSettingsView();

})(jQuery);