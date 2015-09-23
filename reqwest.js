define([
  './qwest'
],(
  qwest
)=>{
  var cacheStash = {}

  var defaultOptions = {
    responseType: "json"
  }

  return {
    call(url,data,options={}){
      options = Object.merge(defaultOptions,options)
      return new Promise((success,failure)=>{
        (data
          ? qwest.post(url,data,options)
          : qwest.get(url,null,options)
        )
          .then(success)
          .catch(failure)
      })
    },
    callCache(url,data,maxAge=3600){
      var key = JSON.stringify(arguments);
      if(cacheStash[key]){
        return cacheStash[key]
      }else {
        var localCacheOnly = Object.isString(maxAge);
        setTimeout(()=>delete(cacheStash[key]),
          localCacheOnly
            ? 3600*1000
            : maxAge*1000
        )
        return cacheStash[key] = this.call(url, data, (
          localCacheOnly
            ? {}
            : {
              cache: maxAge
            }
        ))
      }
    }
  }
})
