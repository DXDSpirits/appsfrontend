// 转义字符 "\n" 转换为 html 标签 <br/>
function return2br(str){
    if(str == null||str == ""){
        return "";
    }else{
        return str.replace(/\r?\n/g,"<br/>");
    }
}
//验证字符串是否为手机或者固话
//规则说明：
//1、可以是1开头的11位数字（手机号）
//2、可以是“区号-电话号-分机号”或者是“(区号)电话号-分机号”格式
//3、区号是0开头的3～4位数字，可以没有区号
//4、电话号是5～8位数字，不能以0开头
//5、分机号是1～8位数字，可以没有分机号
function isMobile(str){
    var r=/^1\d{10}$|^(0\d{2,3}-?|\(0\d{2,3}\))?[1-9]\d{4,7}(-\d{1,8})?$/;
    return r.test(str);
}
//验证人数是否为小于等于 3 位数的正整数
function isPeople(str){
    var r =/^\+?[1-9][0-9]{0,2}$/;
    return r.test(str);
}

function changeLabelLineHeight(num){
    for(i=1;i<=num;i++){
        $(".option-" + i).children("label").css("line-height",$(".option-" + i).height() + "px");
    }
}
function changeWrappingPaddingTop(num){
    for(i=1;i<=num;i++){
        $(".wrapping-" + i).css("padding-top",($(".wrapping-" + i).parent(".poll-show-option").height() - 20)/2 + "px");
    }
}
