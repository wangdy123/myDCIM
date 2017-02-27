    /**
	 * redis操作示例
	 */  
      
    // 准备工作：npm install redis co-redis (--save)
    // 开发机ip：
    // 默认端口：6379
      
    // 文档参考：https://www.npmjs.com/package/redis (node-redis)
    // 文档参考：https://www.npmjs.com/package/co-redis (co-redis)
    // 文档参考：http://www.redis.cn/commands.html (redis命令)
      
    // 开发机测试配置：启动redis服务后加 --protected-mode no 选项 使其允许远程连接
      
    var co = require('co');  
    var redis = require('redis');  
    var wrapper = require('co-redis');  
    var log = Log('models.redis');  
      
    // var redisClient = redis.createClient();
      
    // redis配置参数
    var redis_config = {  
        "host": "",  
        "port": 6379  
    };  
    var redisClient = redis.createClient(redis_config);  
    // 数据库选择/* * redis默认连接数据库0,可以利用select选择指定数据库0~15 * 使用示例： *
    redisClient.select("15", function (err) { * if (err) { * return false; * } else { * console.log('connect success'); * } * }); */  
    或者直接  
    var redisClient = redis.createClient('redis://100.131.26.110:8009?database=0');  
    // 使用co-redis包装redisClient
    var redisCo = wrapper(redisClient);  
      
    // 利用co-redis包装将redis命令以返回值形式直接输出
    /*
	 * co(function* () { var set = yield redisCo.set('test', 33); console.log(set); console.log(yield
	 * redisCo.get('test')); // logs 33
	 * 
	 * redisClient.quit(); }).catch(function(e) {
	 * 
	 * });
	 */  
      
    // redis命令使用示例
    /*
	 * 基本示例： redisClient.set('key', 'value', function (res, reply) {});
	 * 
	 * 命令参数： 1、字符串 2、数组 (注：非所有命令均可用) (对于hash操作，赋值可使用json) (后跟回调函数[可选]) (利用co-redis可以将命令以返回值形式输出)
	 * 
	 * 使用示例(不同参数样式实现相同功能)
	 * 
	 * client.hmset(["key", "test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res)
	 * {}); client.hmset("key", ["test keys 1", "test val 1", "test keys 2", "test val 2"], function (err,
	 * res) {}); client.hmset("key", "test keys 1", "test val 1", "test keys 2", "test val 2", function (err,
	 * res) {});
	 * 
	 * client.set("some key", "some val"); client.set(["some other key", "some val"]);
	 * 
	 * client.hmset(hash, obj[, callback]) (此处可以使用json) client.hmset(hash, key1, val1, ... keyn, valn,
	 * [callback])
	 */  
      
     // redis数据类型命令汇总
     /*
		 * string 字符串 命令 行为 返回值 使用示例(略去回调函数) set 设置存储在给定键中的值 OK set('key', 'value') get 获取存储在给定键中的值 value/null
		 * get('key') del 删除存储在给定键中的值(任意类型) 1/0 del('key') incrby 将键存储的值加上整数increment incrby('key', increment)
		 * decrby 将键存储的值减去整数increment decrby('key', increment) incrbyfloat 将键存储的值加上浮点数increment
		 * incrbyfloat('key', increment) append 将值value追加到给定键当前存储值的末尾 append('key', 'new-value') getrange
		 * 获取指定键的index范围内的所有字符组成的子串 getrange('key', 'start-index', 'end-index') setrange 将指定键值从指定偏移量开始的子串设为指定值
		 * setrange('key', 'offset', 'new-string')
		 * 
		 * list 列表 命令 行为 返回值 使用示例(略去回调函数) rpush 将给定值推入列表的右端 当前列表长度 rpush('key', 'value1' [,'value2']) (支持数组赋值)
		 * lrange 获取列表在给定范围上的所有值 array lrange('key', 0, -1) (返回所有值) lindex 获取列表在给定位置上的单个元素 lindex('key', 1)
		 * lpop 从列表左端弹出一个值，并返回被弹出的值 lpop('key') rpop 从列表右端弹出一个值，并返回被弹出的值 rpop('key') ltrim 将列表按指定的index范围裁减
		 * ltrim('key', 'start', 'end')
		 * 
		 * set 集合 命令 行为 返回值 使用示例(略去回调函数) sadd 将给定元素添加到集合 插入元素数量 sadd('key', 'value1'[, 'value2', ...])
		 * (不支持数组赋值)(元素不允许重复) smembers 返回集合中包含的所有元素 array(无序) smembers('key') sismenber 检查给定的元素是否存在于集合中 1/0
		 * sismenber('key', 'value') srem 如果给定的元素在集合中，则移除此元素 1/0 srem('key', 'value') scad 返回集合包含的元素的数量
		 * sacd('key') spop 随机地移除集合中的一个元素，并返回此元素 spop('key') smove 集合元素的迁移 smove('source-key', 'dest-key',
		 * 'item') sdiff 返回那些存在于第一个集合，但不存在于其他集合的元素(差集) sdiff('key1', 'key2'[, 'key3', ...]) sdiffstore
		 * 将sdiff操作的结果存储到指定的键中 sdiffstore('dest-key', 'key1', 'key2' [,'key3' ,...]) sinter
		 * 返回那些同事存在于所有集合中的元素(交集) sinter('key1', 'key2'[, 'key3', ...]) sinterstore 将sinter操作的结果存储到指定的键中
		 * sinterstore('dest-key', 'key1', 'key2' [,'key3' ,...]) sunion 返回那些至少存在于一个集合中的元素(并集) sunion('key1',
		 * 'key2'[, 'key3', ...]) sunionstore 将sunion操作的结果存储到指定的键中 sunionstore('dest-key', 'key1', 'key2'
		 * [,'key3' ,...])
		 * 
		 * hash 散列 命令 行为 返回值 使用示例(略去回调函数) hset 在散列里面关联起给定的键值对 1(新增)/0(更新) hset('hash-key', 'sub-key', 'value')
		 * (不支持数组、字符串) hget 获取指定散列键的值 hget('hash-key', 'sub-key') hgetall 获取散列包含的键值对 json hgetall('hash-key')
		 * hdel 如果给定键存在于散列里面，则移除这个键 hdel('hash-key', 'sub-key') hmset 为散列里面的一个或多个键设置值 OK hmset('hash-key',
		 * obj) hmget 从散列里面获取一个或多个键的值 array hmget('hash-key', array) hlen 返回散列包含的键值对数量 hlen('hash-key')
		 * hexists 检查给定键是否在散列中 1/0 hexists('hash-key', 'sub-key') hkeys 获取散列包含的所有键 array hkeys('hash-key')
		 * hvals 获取散列包含的所有值 array hvals('hash-key') hincrby 将存储的键值以指定增量增加 返回增长后的值 hincrby('hash-key',
		 * 'sub-key', increment) (注：假如当前value不为为字符串，则会无输出，程序停止在此处) hincrbyfloat 将存储的键值以指定浮点数增加
		 * 
		 * 
		 * zset 有序集合 命令 行为 返回值 使用示例(略去回调函数) zadd 将一个带有给定分支的成员添加到有序集合中 zadd('zset-key', score, 'key')
		 * (score为int) zrange 根据元素在有序排列中的位置，从中取出元素 zrangebyscore 获取有序集合在给定分值范围内的所有元素 zrem 如果给定成员存在于有序集合，则移除
		 * zcard 获取一个有序集合中的成员数量 有序集的元素个数 zcard('key')
		 * 
		 */  
      
      // redis其他常用命令汇总
      /*
		 * keys命令组 命令 行为 返回值 使用示例(略去回调函数) del 删除一个(或多个)keys 被删除的keys的数量 del('key1'[, 'key2', ...]) exists
		 * 查询一个key是否存在 1/0 exists('key') expire 设置一个key的过期的秒数 1/0 expire('key', seconds) pexpire
		 * 设置一个key的过期的毫秒数 1/0 pexpire('key', milliseconds) expireat 设置一个UNIX时间戳的过期时间 1/0 expireat('key',
		 * timestamp) pexpireat 设置一个UNIX时间戳的过期时间(毫秒) 1/0 pexpireat('key', milliseconds-timestamp) persist
		 * 移除key的过期时间 1/0 persist('key') sort 对队列、集合、有序集合排序 排序完成的队列等 sort('key'[, pattern, limit offset
		 * count])
		 * 
		 * flushdb 清空当前数据库
		 * 
		 */  
      
    co(function* () {  
      // var set = yield redisCo.sadd('set-key', [item, item1, item2, item3, item4]);
      var json = {  
        'sub-key5': 'value6',  
        'sub-key7': 'value7'  
      };  
      var array = ['sub-key4', 'sub-key5'];  
      // var hash = yield redisCo.hset('hash-key', 'sub-key4', 'value4');
        var hash = yield redisCo.hgetall('hash-key');  
        console.log(hash);  
      
      redisClient.quit();  
    });  
      
    // redis事务(支持连贯操作)
    /*
	 * 常用命令 multi() 事务 exec([callback]) 执行事务 discard 放弃事务 watch 监视指定的键值 unwatch 取消监视
	 * 
	 * 命令用法： MULTI MULTI 命令用于开启一个事务，它总是返回 OK 。 MULTI 执行之后， 客户端可以继续向服务器发送任意多条命令， 这些命令不会立即被执行， 而是被放到一个队列中， 当
	 * EXEC命令被调用时， 所有队列中的命令才会被执行。 另一方面， 通过调用 DISCARD ， 客户端可以清空事务队列， 并放弃执行事务。 EXEC EXEC 命令的回复是一个数组，
	 * 数组中的每个元素都是执行事务中的命令所产生的回复。 其中， 回复元素的先后顺序和命令发送的先后顺序一致。 DISCARD 当执行 DISCARD 命令时， 事务会被放弃， 事务队列会被清空，
	 * 并且客户端会从事务状态中退出 WATCH WATCH 命令可以为 Redis 事务提供 check-and-set （CAS）行为。 被 WATCH 的键会被监视，并会发觉这些键是否被改动过了。
	 * 如果有至少一个被监视的键在 EXEC 执行之前被修改了， 那么整个事务都会被取消， EXEC 返回nil-reply来表示事务已经失败。
	 * 
	 * WATCH 使得 EXEC 命令需要有条件地执行： 事务只能在所有被监视键都没有被修改的前提下执行， 如果这个前提不能满足的话，事务就不会被执行。
	 * 
	 * WATCH 命令可以被调用多次。 对键的监视从 WATCH 执行之后开始生效， 直到调用 EXEC 为止。
	 * 
	 * 当 EXEC 被调用时， 不管事务是否成功执行， 对所有键的监视都会被取消。 另外， 当客户端断开连接时， 该客户端对键的监视也会被取消。 UNWATCH 使用无参数的 UNWATCH
	 * 命令可以手动取消对所有键的监视。
	 * 
	 * 使用示例： 1、连贯操作 client.multi().incr('key').incr('key').exec(function (err, reply) {});
	 * 
	 * 2、常规操作 multi = client.multi(); multi.incr('key'); multi.incr('key'); multi.exec(function (err, replies)
	 * {});
	 * 
	 * 3、取巧操作 client.multi([ ["mget", "multifoo", "multibar", redis.print], ["incr", "multifoo"], ["incr",
	 * "multibar"] ]).exec(function (err, replies) { console.log(replies); });
	 * 
	 */  
      
    // 事件监听
    /*
	 * 事件：ready、connect、reconnecting、end、warning、error 执行顺序： ready > connect > end(quit触发) error事件需要设置监听(必选)
	 * 
	 * 使用示例： redisClient.on("ready", function(err) { if (err) return false; console.log("ready"); });
	 */  
      
    redisClient.on("error", function (err) {  
      console.log("Error " + err);  
    });  
      
    // 数据操作(未用co-redis包装的写法)
      
    // string(增、删、改、查)
    /*
	 * redisClient.set('string key', 'string value', function (err, reply) { if (err) return false;
	 * console.log(reply); // 设置成功,返回值为OK,数据更改直接更改对应的value即可，返回值也为OK。 }); redisClient.set('string key1',
	 * 'string value1', redis.print); // 此种方式直接在命令行打印返回值。 redisClient.get('string key', function (err, reply) {
	 * if (err) return false; console.log(reply); // 取值成功，返回指定键值对应的value,若键值不存在，返回null });
	 * redisClient.exists('string key2', function (err, reply) { if (err) return false; console.log(reply); //
	 * 键存在，返回1，否则返回0 }); redisClient.del('string key1', function (err, reply) { if (err) return false;
	 * console.log(reply); // 删除成功，返回1，否则返回0(对于不存在的键进行删除操作，同样返回0) }); redisClient.randomkey(function (err,
	 * reply) { if (err) return false; console.log(reply); // 随机返回一个键 });
	 * 
	 * redisClient.set('string key', 'string value', function(err, reply) { if (err) return false;
	 * console.log(reply); });
	 * 
	 * redisClient.expire('string key', 1, function(err, reply) { if (err) return false; console.log(reply);
	 * });
	 * 
	 * redisClient.get('string key', function (err, reply) { if (err) return false; console.log(reply); //
	 * 取值成功，返回指定键值对应的value,若键值不存在，返回null });
	 * 
	 * setTimeout(function () { redisClient.get('string key', function (err, reply) { if (err)
	 * console.log(err); console.log(reply); // 取值成功，返回指定键值对应的value,若键值不存在，返回null }); }, 1100);
	 */  
      
    // list
      
    // set
      
    // sorted set
      
    // hash
      
    // redisClient.end(true);
    // redisClient.quit();
      
    exports.redisClient = function() {  
        var redisClient = redis.createClient(redis_config);  
        var redisCo = wrapper(redisClient);  
        return redisCo;  
    };  
      
    exports.redisSave = function() {  
        return co(function * () {  
            var redisClient = exports.redisClient();  
      
        }).catch(function(error) {  
            log.error('models.redis.order.add(' + JSON.stringify(order) + ')', error);  
        return false;  
        });  
    };  
      
    exports.add = function(order) {  
        return co(function * () {  
        var result = yield exports.redisSave();  
        return result;  
      }).catch(function(error) {  
        log.error('models.redis.order.add(' + JSON.stringify(order) + ')', error);  
        return false;  
      });  
    };  