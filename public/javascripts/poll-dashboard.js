(function() {
    var APIRoot = 'http://apps.wedfairy.com/api/';
    var voteTotalNum = 0;

    //polls collection view
    var PollCollectionView = Amour.CollectionView.extend({
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

    var PollDashboardView = Amour.View.extend({
        events: {
            // 'click .map-show-route': 'map_show_route'
            'click [data-route]': 'routeTo',
        },
        el: $('#poll-dashboard-wrapper'),
        initialize: function() {
            this.pollID = location.href.match(/poll\/(\d+)/)[1];
            this.token = location.href.match(/\?token=(\w+)/)[1];

            this.polls = new (Amour.Collection.extend({
                url: APIRoot + "polls/poll/" + this.pollID + '/poll_options/?token=' + this.token,
                model: Amour.Model,
                parse: function(response) {
                    var response = Amour.Collection.prototype.parse.call(this, response);
                    return response;
                }
            }))();
            this.pollsCollectionView = new PollCollectionView({
                collection: this.polls,
                el: this.$('.poll-result-wrapper')
            });
            this.pollInfoFetch();
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            }
        },
        pollInfoFetch: function() {
            //从 api 中读取数据
            var self = this;
            var model = new (Backbone.Model.extend({
                urlRoot: APIRoot + "polls/poll/" + this.pollID,
            }))();
            model.fetch({
                success: function (data) {
                    voteTotalNum = data.get('count');
                    self.$(".poll-deadline-text").html(model.get('deadline'));
                    self.$('.poll-title').html(model.get('title'));
                    self.$('.poll-message').text(data.get('message'));
                    self.$(".dashboard-total-num").children(".text-default-color").text(voteTotalNum);
                    self.pollNumFetch();
                }
            })
        },
        pollNumFetch: function() {
            //从 api 中读取数据
            var self = this;
            this.polls.fetch({})
        },
        calcTotalNum: function(collection) {
            var sum = _.reduce(collection.pluck('count'), function(memo, num){ return memo + num; }, 0);
            // this.$('.dashboard-total-num .text-default-color').html(sum);
            // voteTotalNum = sum;
        }
    })
    var pollDashboard = new PollDashboardView();
})(jQuery);
