/**
 * Created by lailai on 2017/9/27.
 */
var superagent=require('superagent');  //发送http请求
var cheerio=require('cheerio'); //简析http请求返回的html内容
var async=require('async');//多线程并发控制-异步
var fs=require('fs');
var request=require('request');
console.log("爬虫程序开始运行............");
superagent.post('http://wcatproject.com/charSearch/function/getData.php')
    .send({
        info: 'isempty',
        star: [0,0,0,1,0],
        job: [0,0,0,0,0,0,0,0,0],
        type: [0,0,0,0,0,0,0],
        phase: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        cate: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        phases: ['初代','第一期','第二期','第三期','第四期','第五期','第六期','第七期','第八期','第九期','第九期',
            '第十期','第十一期','第十二期','第十三期','第十四期','第十五期','第十六期','第十七期','第十八期','第十九期','第二十期',
            '第二十一期','第二十二期'],
        cates: ['活動限定','限定角色','聖誕2014','正月2015','黑貓2015','中川限定','茶熊限定','夏日2015','七大罪','獅劍2015','溫泉限定',
            '聖誕2015','正月2016','黑貓2016','茶熊2016','騎士限定','夏日2016','偵探限定','獅劍2016','獵人合作']
    })
    .set('Accept','application/json, text/javascript, */*; q=0.01')
    .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
    .end(function(err,res){
        var json=JSON.parse(res.text);
        //并发遍历json对象
        async.mapLimit(json,5,function(hero,callback){
            var heroId=hero[0];//获取角色Id
            fetchInfo(heroId,callback);
        },function(err,result){
            if(err){
                console.log('抓取出错了');
            }
            console.log('抓取的角色数:'+json.length);
            console.log(result);
        });
    });

//获取每个角色的详细信息
var concurrencyCount=0; //当前并发数记录
var as2Url='http://wcatproject.com/img/as2/';
var fetchInfo= function (heroId,callback) {
    //根据角色Id进行详细页面的爬取和数据解析
    //superagent.get('http://wcatproject.com/char/'+heroId)
    //    .end(function(err,res){
    //        if(err){
    //            console.log('角色为'+heroId+'的详细数据爬取出错了....');
    //        }
    //        //获取爬到的角色详细页面内容
    //        var $=cheerio.load(res.text,{decodeEntities:false});
    //        //对页面内容进行解析，获取需要的数据
    //        console.log(heroId+'\t'+'队长技能'+'\t'+$('.leader-skill span').last().text());
    //        console.log(heroId+'\t'+'被动技能'+'\t'+$('.passive-skill .ps-content').text());
    //        concurrencyCount--;
    //        callback(null,heroId);
    //    });

    //下载链接
    var url=as2Url+heroId+'.gif';
    //本地保存路径
    var filepath='img/'+heroId+'.gif';
    //判断文件是否存在
    fs.exists(filepath,function(exists){
        if(exists){
            //文件以及存在
            console.log(filepath+'is exists');
            callback(null,'exists');
        }else{
            //文件不存在，开始下载文件
            concurrencyCount++;
            console.log('....当前正在抓取'+heroId+',当前并发数为:'+concurrencyCount+',正在抓取的是:'+url);
            request.head(url,function(err,res,body){
                if(err){
                    console.log('err:'+err);
                    concurrencyCount--;
                    callback(null,err);
                }
                request(url).on('error',function(err){
                    console.log('err:'+err);
                    concurrencyCount--;
                    callback(null,url);
                }).pipe(fs.createWriteStream(filepath).on('error',function(err){
                        console.log('error:'+err);
                    callback(null,err);
                })
                ).on('close',function(){
                    console.log('Done:'+url);
                    concurrencyCount--;
                    callback(null,url);
                });
            });
            //request({uri:url,encoding:'binary'},function(err,res,body){
            //    if(!err && res.statusCode==200){
            //        fs.writeFile(filepath,body,'binary',function(err){
            //            if(err){
            //                console.log(err);
            //                concurrencyCount--;
            //                callback(null,url);
            //            }
            //        });
            //    }
            //});
        }
    });
};