import axios from 'axios'

// 火山引擎图片生成 API
const ARK_API_KEY = 'edf20e7a-347e-4837-bef0-8409be866867'
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
const MODEL_NAME = 'doubao-seedream-4-5-251128'

/**
 * 生成图片
 * @param {Object} params - 生成参数
 * @param {string} params.prompt - 图片描述
 * @param {string} params.size - 图片尺寸，格式：widthxheight，如 "500x500"
 * @returns {Promise} 返回生成的图片信息
 */
export const generateImage = async (params) => {
  const { prompt, size = '500x500' } = params
  
  try {
    const response = await axios.post(
      ARK_API_URL,
      {
        model: MODEL_NAME,
        prompt: prompt,
        size: size,
        watermark: false,
        response_format: 'b64_json'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`
        }
      }
    )
    
    return {
      code: 0,
      data: response.data
    }
  } catch (error) {
    console.error('图片生成失败:', error)
    
    // 解析错误信息
    const errorData = error.response?.data
    let errorMessage = error.message || '图片生成失败'
    
    // 检查是否是模型未激活的错误
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message
      
      // 如果是模型未激活错误，提供更详细的提示
      if (errorMessage.includes('not activated') || errorMessage.includes('未激活')) {
        errorMessage = `模型 ${MODEL_NAME} 未激活。请在火山引擎控制台激活该模型服务：https://console.volcengine.com/ark\n错误详情：${errorMessage}`
      }
    }
    
    return {
      code: -1,
      msg: errorMessage,
      error: errorData
    }
  }
}

