const app = getApp()

Page({
  data: {
    show_auth:app.globalData.show_auth,
    userInfo: {},
    list:[],
    imageUrl: app.globalData.imageUrl,
    pageSize: 10,
    pageNumber: 0,
    initPageNumber: 0,
    showGeMoreLoadin: false,
    notDataTips:false,
    sharecomeIn:false
  },

  onLoad: function (e) {
    if(e.id != undefined){
      this.setData({ sharecomeIn:true})
    }
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            show_auth:true
          });
        }else{
          if (e.id != undefined) {
            that.setData({ sharecomeIn: false })
            wx.navigateTo({
              url: '/pages/album_detail/album_detail?id=' + e.id
            })
          }
        }
      }
    })

    this.getList();
  },

  onReady(){
  },
  
  onShow: function (option) {
    
  },

  downloadImage: function (e) {
    let id = e.currentTarget.dataset.id;
    let objId = e.currentTarget.dataset.objid;
    let _this = this;
    wx.showLoading({
      title: '图片保存中...',
    });
    wx.downloadFile({
      url: id,
      success: function (res) {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.hideLoading();
              _this.saveDownload(objId,1);
            },
            fail(res) {
              wx.showToast({
                title: '保存图片失败！',
              })
            }
          })
        }
      }
    })

  },

  saveDownload: function (id,type) {
    app.http("POST", `/picture/download_log/${id}`, {type:type}, function (res) {
      let resData = res.data;
    })
  },

  getList(){
    let _this = this;
    app.http("GET", "/picture/list"+`?pageSize=${ this.data.pageSize }&pageNumber=${ this.data.pageNumber }`, {}, function (res) {
      _this.setData({ showGeMoreLoadin: false })
      let resData = res.data;
      let list = _this.data.list;
      if (resData.code == 0) {
        if(resData.data.length > 0){
          resData.data.map(item => {
            list.push(item)
          })
          _this.setData({
            list: list,
            pageNumber: _this.data.pageNumber + 1
          })
        }else{
          _this.setData({ notDataTips:true})
        }
      }
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    this.setData({ 
      showGeMoreLoadin: true,
      notDataTips:false
    })
    this.getList();
  },

  /**
   * 监听用户点击授权按钮
   */
  getAuthUserInfo:function(data){
    app.globalData.show_auth = false;
    this.setData({
      show_auth:false
    });

    let _this = this;
    app.login(null, null, null, function(){
      let sharecomeIn = _this.data.sharecomeIn;
      if(sharecomeIn == true){
        _this.setData({ sharecomeIn: false })
        wx.navigateTo({
          url: '/pages/album_detail/album_detail?id=' + e.id
        })
      }
      _this.getList();
    });
  },


  /**
 * 预览图片
 */
  previewMoreImage: function (event) {
    let _this = this;

    let images = event.currentTarget.dataset.obj.map(item=>{
      return _this.data.baseImageUrl+item;
    });

    let url = event.target.id;

    wx.previewImage({
      current: url,
      urls: images
    })
  },
  /**
   * 进入专辑详情页面
   */
  openDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/album_detail/album_detail?id='+id
    })
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    let id = '';
    if (res.target != undefined){
      id = res.target.id;
    }

    return {
      title: '唯美图吧，唯美生活',
      path: '/pages/index/index?id='+id,
      //imageUrl: '/image/share1.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})