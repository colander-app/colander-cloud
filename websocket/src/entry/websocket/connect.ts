import { proxyEventSuccess } from '@/utils/lambda/apigateway'

export const handler = async () => {
  return proxyEventSuccess('ok', 200)
}
