import { exec } from 'child_process'
import { differenceInMilliseconds } from 'date-fns'
import { ProbeRequestResult } from '../../../../interfaces/request'
import type { ProbeRequestResponse } from '../../../../interfaces/request'
import type { Script } from '../../../../interfaces/probe'

export async function scriptRequest(
  params: Script
): Promise<ProbeRequestResponse> {
  return new Promise((resolve) => {
    const { cmd, workingDir } = params
    const timeout = params.timeout || 10_000

    const startTime = new Date()
    const response: ProbeRequestResponse = {
      requestType: 'script',
      body: '',
      status: 0,
      responseTime: 0,
      isProbeResponsive: true,
      result: ProbeRequestResult.unknown,
      data: '',
      headers: '',
    }

    try {
      exec(
        cmd,
        { cwd: workingDir, timeout },
        (error: any, body, errMessage) => {
          const endTime = new Date()
          response.responseTime = differenceInMilliseconds(endTime, startTime)

          response.body = body
          if (error) {
            response.status = error?.code || 1
            response.body = errMessage
            response.errMessage = errMessage
            response.result = ProbeRequestResult.failed
          } else {
            response.result = ProbeRequestResult.success
          }

          resolve(response)
        }
      )
    } catch (error: any) {
      response.status = -1
      response.result = ProbeRequestResult.failed
      response.errMessage = error.message
      response.isProbeResponsive = false
      const endTime = new Date()
      response.responseTime = differenceInMilliseconds(endTime, startTime)
      resolve(response)
    }
  })
}
