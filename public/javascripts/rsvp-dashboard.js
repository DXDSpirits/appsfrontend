(function() {
    var APIRoot = 'http://apps.wedfairy.com/api/';

    //guests collection view
    var RsvpGuestsCollectionView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: {

            },
            className: 'rsvp-item',
            template: $('#template-rsvp-guest-item').html(),
            serializeData: function() {
                var data = Amour.ModelView.prototype.serializeData.call(this);
                data.avatar = data.avatar || "/public/images/default-avatar.png";
                data.formatted_date = moment(data.time_created).format('YYYY-MM-DD HH:mm');
                return data;
            }
        })
    });

    var RsvpDashboardView = Amour.View.extend({
        events: {
            // 'click .map-show-route': 'map_show_route'
            'click [data-route]': 'routeTo',
        },
        el: $('#rsvp-dashboard-wrapper'),
        initialize: function() {
            this.rsvpID = location.href.match(/rsvp\/(\d+)/)[1];
            this.token = location.href.match(/\?token=(\w+)/)[1];

            this.guests = new (Amour.Collection.extend({
                url: APIRoot + "rsvps/rsvp/" + this.rsvpID + '/guests/?token=' + this.token,
                model: Amour.Model,
                parse: function(response) {
                    var response = Amour.Collection.prototype.parse.call(this, response);
                    return response;
                }
            }))();
            this.guestCollectionView = new RsvpGuestsCollectionView({
                collection: this.guests,
                el: this.$('.dashboard-guests-list')
            });
            this.rsvpTimeFetch();
            this.rsvpNumFetch();
        },
        routeTo: function(e) {
            var route = $(e.currentTarget).data('route');
            if (route == 'return') {
                window.history.back();
            }
        },
        rsvpTimeFetch: function() {
            //从 api 中读取数据
            var self = this;
            var model = new (Backbone.Model.extend({
                urlRoot: APIRoot + "rsvps/rsvp/" + this.rsvpID,
            }))();
            model.fetch({
                success: function (data) {
                    self.$(".dashboard-total-deadline").children(".text-default-color").text(data.get('deadline'));
                }
            })
        },
        rsvpNumFetch: function() {
            //从 api 中读取数据
            var self = this;
            this.guests.fetch({
                success: function(collection) {
                    // var guestNum = collection.models.length;
                    // console.log(collection);
                    self.insertPeopleNum(collection);
                }
            })
        },
        insertPeopleNum: function(collection) {
            var sum = _.reduce(collection.pluck('people'), function(memo, num){ return memo + num; }, 0);
            this.$('.dashboard-total-num .text-default-color').html(sum);
        }

    })
    var rsvpDashboard = new RsvpDashboardView();
})(jQuery);