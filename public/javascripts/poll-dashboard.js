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
                    // self.$(".dashboard-total-deadline").children(".text-default-color").text(data.get('deadline'));
                    self.$('.poll-message').text(data.get('message'));
                    self.$(".dashboard-total-num").children(".text-default-color").text(voteTotalNum);
                    self.pollNumFetch();
                }
            })
        },
        pollNumFetch: function() {
            //从 api 中读取数据
            var self = this;
            this.polls.fetch({
                success: function(collection) {
                    // self.calcTotalNum(collection);
                }
            })
        },
        calcTotalNum: function(collection) {
            var sum = _.reduce(collection.pluck('count'), function(memo, num){ return memo + num; }, 0);
            // this.$('.dashboard-total-num .text-default-color').html(sum);
            // voteTotalNum = sum;
        }

    })
    var pollDashboard = new PollDashboardView();

    // // 主流程
    // $.ajax({
    //     url: "<%= api_root %>polls/poll/<%= poll_id %>/",
    //     type: "GET",
    //     success: function (data) {
    //         //写入「截止日期」「投票人数」「标题」「开场白」
    //         $(".poll-total-left").children(".highlight").text(data.deadline);
    //         $(".poll-total-right").children(".highlight").text(data.count + " 人");
    //         $(".poll-title").html(return2br(data.title));
    //         $(".poll-message").append(return2br(data.message));
    //         //保存投票属性到 sessionStorage
    //         sessionStorage.setItem("poll_select",data.select);
    //         poll_result_list();
    //     }
    // });
    // function poll_result_list(){
    //     $.ajax({
    //         url: "<%= api_root %>polls/poll/<%= poll_id %>/poll_options/",
    //         type: "GET",
    //         success: function (data){
    //             sessionStorage.setItem("votes_max",0);
    //             for(i = 0;i < data.length;i ++){
    //                 //保存选项内容到 sessionStorage
    //                 sessionStorage.setItem("option_"+ data[i].id +"_content",data[i].content);
    //                 //渲染选项列表
    //                 if(+sessionStorage.getItem("poll_select")){
    //                     //文字投票
    //                     $(".poll-result-list").append(
    //                             "<div class='poll-result-option'>" +
    //                             "<div class='result-option-left'>" + data[i].count +
    //                             "<div class='result-option-color color-"+ (i+1) +"'></div>" +
    //                             "</div>" +
    //                             "<div class='result-option-right'>"+ data[i].content +"</div>" +
    //                             "<div class='clear'></div>" +
    //                             "</div>");
    //                     if (data[i].count > Number(sessionStorage.getItem("votes_max"))){
    //                         sessionStorage.setItem("votes_max",data[i].count);
    //                     }
    //                 }else{
    //                     //图片投票
    //                     $(".poll-result-list").append(
    //                             "<div class='poll-result-option'>" +
    //                             "<div class='result-option-left'>" + data[i].count +
    //                             "<div class='result-option-color color-"+ (i+1) +"'></div>" +
    //                             "</div>" +
    //                             "<img class='result-option-right' src='"+ data[i].content +"'/>" +
    //                             "<div class='clear'></div>" +
    //                             "</div>");
    //                     if (data[i].count > Number(sessionStorage.getItem("votes_max"))){
    //                         sessionStorage.setItem("votes_max",data[i].count);
    //                     }
    //                 }
    //             }
    //             poll_result_chart();
    //             voter_list();
    //         }
    //     });
    // }

    // function poll_result_chart(){
    //     //渲染选项图表
    //     $.ajax({
    //         url: "<%= api_root %>polls/poll/<%= poll_id %>/poll_options/",
    //         type: "GET",
    //         success: function (data){
    //             if(Number(sessionStorage.getItem("votes_max")) == 0){
    //                 $(".poll-result-chart").hide();
    //             }else{
    //                 for(i = 0;i < data.length;i ++){
    //                     var percent = data[i].count / Number(sessionStorage.getItem("votes_max")) * 100;
    //                     $(".poll-result-chart").append(
    //                             "<div class='chart-bar color-"+ (i+1) +" wow fadeInRight' style='width:"+ percent +"%;'></div>"
    //                     );
    //                 }
    //             }
    //         }
    //     });
    // }
    // function voter_list(){
    //     //渲染「投票详情」列表
    //     $.ajax({
    //         url: "<%= api_root %>polls/poll/<%= poll_id %>/votes/?token=<%= token %>",
    //         type: "GET",
    //         success: function (data) {
    //             for(i = 0;i < data.length;i ++){
    //                 $(".voter-list").prepend(
    //                         "<div class='voter-details wow fadeInUp'>" +
    //                         "<img src='"+ data[i].avatar +"'/>" +
    //                         "<div>" +
    //                         "<label><span>"+ data[i].name +"</span>选择了<span>"+ getContentByOptionId(data[i].option) +"</span></label>" +
    //                         "<label class='details-date'>"+ data[i].created_date +"</label>" +
    //                         "</div>" +
    //                         "</div>");
    //             }
    //         }
    //     });
    // }
    // function getContentByOptionId(num){
    //     //根据 optionId 从 sessionStorage 获取 content
    //     return sessionStorage.getItem("option_"+ num +"_content");
    // }
})(jQuery);