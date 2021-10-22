import { request } from '@umijs/plugin-request'

/**
 * 根据请求Api获取token
 */
const getToken = () => {
  let token = ''
  if (sessionStorage.getItem('token') != null) {
    token = {
      Authorization: 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return token
}

/**
 * POST 请求
 * @param {*} requestUrl
 * @param {*} requestParams
 * @param {*} responseParams
 * @returns
 */
export function getData(requestUrl, requestParams, responseParams) {
  return requestFunction('POST', requestUrl, requestParams, responseParams)
}

/**
 * GET 请求
 * @param {*} requestUrl
 * @param {*} requestParams
 * @param {*} responseParams
 */
export function getDataByGet(requestUrl, requestParams, responseParams) {
  return requestFunction('GET', requestUrl, requestParams, responseParams)
}

/**
 * PUT 请求
 * @param {*} requestUrl
 * @param {*} requestParams
 * @param {*} responseParams
 * @returns
 */
export function getDataPut(requestUrl, requestParams, responseParams) {
  return requestFunction('PUT', requestUrl, requestParams, responseParams)
}

/**
 * DELETE 请求
 * @param {*} requestUrl
 * @param {*} requestParams
 * @param {*} responseParams
 */
export function getDataDelete(requestUrl, requestParams, responseParams) {
  return requestFunction('DELETE', requestUrl, requestParams, responseParams)
}

/**
 * 从服务器获取数据 request for formdata
 * @param {*} requestUrl 接口地址
 * @param {*} requestParams 请求参数
 * @param {Array} responseParams 返回数据中需要的参数名 返回的数据会根据responseParams参数列表的顺序返回数据。
 */
export function getDataForFormData(requestUrl, requestParams, responseParams) {
  return requestFunction('POST', requestUrl, requestParams, responseParams)
}

/**
 * 上传文件
 * @param {*} requestUrl
 * @param {*} requestParams
 * @param {*} responseParams
 * @returns
 */
export function uploadFile(requestUrl, requestParams, responseParams) {
  return requestFunction('POST', requestUrl, requestParams, responseParams)
}

/**
 * 下载文件  发送请求 获取 返回的blob数据
 * @param {*} method
 * @param {*} url
 * @param {*} params
 * @returns
 */
export function downloadFileGetBlob(method = 'POST', url, requestParams) {
  let params = {}
  if (method == 'GET') {
    params = {
      params: requestParams
    }
  } else {
    params = {
      data: requestParams
    }
  }

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: method,
      headers: {
        ...getToken()
      },
      ...params,
      responseType: 'blob',
      getResponse: true,
      parseResponse: false
    }).then((res) =>
      res.blob().then((blob) => {
        let contentDisposition = res.headers.get('Content-disposition')
        let fileName = ''
        if (
          contentDisposition &&
          contentDisposition.indexOf('filename=') > -1
        ) {
          fileName = decodeURIComponent(
            contentDisposition.substr(
              contentDisposition.indexOf('filename=') + 9
            )
          )
        }

        const objectURL = URL.createObjectURL(blob)
        let btn = document.createElement('a')
        btn.download = fileName
        btn.href = objectURL
        btn.click()
        URL.revokeObjectURL(objectURL)
        btn = null
        resolve(res)
      })
    )
  })
}
/**
 * 下载文件(仓库)  发送请求 获取 返回的blob数据
 * @param {*} method
 * @param {*} url
 * @param {*} params
 * @returns
 */
export function downloadStockFileGetBlob(method = 'POST', url, requestParams) {
  let params = {}
  if (method == 'GET') {
    params = {
      params: requestParams
    }
  } else {
    params = {
      body: JSON.stringify(requestParams)
    }
  }
  // console.log(method, params, 97);

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: method,
      headers: {
        ...getToken(),
        'Content-Type': 'application/json'
      },
      ...params,
      responseType: 'blob',
      getResponse: true,
      parseResponse: false
    }).then((res) =>
      res.blob().then((blob) => {
        let contentDisposition = res.headers.get('Content-disposition')
        let fileName = ''
        if (
          contentDisposition &&
          contentDisposition.indexOf('filename=') > -1
        ) {
          fileName = decodeURIComponent(
            contentDisposition.substr(
              contentDisposition.indexOf('filename=') + 9
            )
          )
        }

        const objectURL = URL.createObjectURL(blob)
        let btn = document.createElement('a')
        btn.download = fileName
        btn.href = objectURL
        btn.click()
        URL.revokeObjectURL(objectURL)
        btn = null
        resolve(res)
      })
    )
  })
}
/**
 * 下载文件  导出数据 对blob数据的处理
 * @param {*} responseData  blob 流数据
 * @returns 文件
 */
export function downloadFileByBlob(responseData, filename) {
  responseData.blob().then((blob) => {
    let blobUrl = window.URL.createObjectURL(blob)

    const aElement = document.createElement('a')

    document.body.appendChild(aElement)

    aElement.style.display = 'none'

    aElement.href = blobUrl

    aElement.download = filename

    aElement.click()

    document.body.removeChild(aElement)
  })
}

/**
 * 请求 functions
 * @param {*} method
 * @param {*} requestUrl
 * @param {*} requestParams
 * @param {*} responseParams
 * @returns
 */
function requestFunction(method, requestUrl, requestParams, responseParams) {
  return new Promise((resolve, reject) => {
    let params = {}
    if (method == 'GET') {
      params = {
        params: requestParams
      }
    } else {
      params = {
        data: requestParams
      }
    }
    request(requestUrl, {
      method: method,
      headers: {
        ...getToken()
      },
      ...params
    }).then((data) => {
      let { error } = data
      if (error == null) {
        if (responseParams == 'all') {
          resolve(data)
        } else {
          const { code, msg } = data
          // code 4002登录状态超时 拦截器已处理
          if (code == 0) {
            resolve(getApiReturnDataByResponseParams(data, responseParams))
          } else {
            console.log('........ 请求失败')
            console.log(code)
            console.log(msg)
            reject(msg)
          }
        }
      } else {
        reject(error)
      }
    })
  })
}

/**
 * 从api返回数据中取出指定的数据
 */
function getApiReturnDataByResponseParams(resData, responseParams) {
  let resultData = []
  if (responseParams != null && typeof responseParams != undefined) {
    responseParams.map((ele) => {
      let responseParamData = resData[ele]
      resultData.push(responseParamData)
    })
  }
  return resultData
}

/**
 *
 * @param {*} blobData
 */
export function blobDataToDownload(blob) {
  // // 提取文件名
  let fileName = 'aaaaaaa'
  // let { headers } = response;
  // if (headers['content-disposition']) {
  //     fileName = response.headers['content-disposition'].match(/filename=(.*)/)[1];
  // } else {
  //     let { config = {} } = response;
  //     let { url = '' } = config;
  //     if (url != '' && url != null) {
  //         fileName = url.substr(url.lastIndexOf('/') + 1);
  //     }
  // }

  // console.log('............. file name');
  // console.log(fileName);
  // // 将二进制流转为blob
  // const blob = new Blob([response.data], { type: 'application/octet-stream' });
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
    window.navigator.msSaveBlob(blob, decodeURI(fileName))
  } else {
    // 创建新的URL并指向File对象或者Blob对象的地址
    const blobURL = window.URL.createObjectURL(blob)
    // 创建a标签，用于跳转至下载链接
    const tempLink = document.createElement('a')
    tempLink.style.display = 'none'
    tempLink.href = blobURL
    tempLink.setAttribute('download', decodeURI(fileName))
    // 兼容：某些浏览器不支持HTML5的download属性
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
    // 挂载a标签
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    // 释放blob URL地址
    window.URL.revokeObjectURL(blobURL)
  }
}
