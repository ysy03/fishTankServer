
module.exports = {
  '/api/daily': {
    get: {
      tags: ['Daily'],
      summary: '어항 일지 조회',
      description: '선택한 날짜의 어항 온도, 수질, 먹이 급여 및 환수 기록을 조회합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'day',
          required: true,
          description: '조회할 날짜 (YYYY-MM-DD)',
          schema: {
            type: 'string',
            format: 'date'
          },
          example: '2026-11-03'
        }
      ],
      responses: {
        200: {
          description: '일지 조회 성공 또는 기록 없음',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  exist: {
                    type: 'boolean'
                  },
                  daily: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      daily_id: { type: 'integer' },
                      device_id: { type: 'string' },
                      max_temperature: { type: 'number' },
                      min_temperature: { type: 'number' },
                      avg_temperature: { type: 'number' },
                      water_quality: { type: 'number' },
                      daily: {
                        type: 'string',
                        format: 'date'
                      }
                    }
                  },
                  waterChange: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        waterchangelog_id: { type: 'integer' },
                        device_id: { type: 'string' },
                        status: {
                          type: 'boolean',
                          nullable: true
                        },
                        started_at: {
                          type: 'string',
                          format: 'date-time'
                        },
                        end_at: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true
                        }
                      }
                    }
                  },
                  Feeding: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        device_id: { type: 'string' },
                        status: { type: 'boolean' },
                        feed_time: {
                          type: 'string',
                          format: 'date-time'
                        }
                      }
                    }
                  },
                  message: {
                    type: 'string'
                  }
                }
              },
              examples: {
                success: {
                  summary: '일지 조회 성공',
                  value: {
                    exist: true,
                    daily: {
                      daily_id: 1,
                      device_id: 'SS501',
                      max_temperature: 27.5,
                      min_temperature: 23.2,
                      avg_temperature: 25.3,
                      water_quality: 250,
                      daily: '2026-11-03'
                    },
                    waterChange: [
                      {
                        waterchangelog_id: 1,
                        device_id: 'SS501',
                        status: true,
                        started_at: '2026-11-03T05:00:00.000Z',
                        end_at: '2026-11-03T05:10:00.000Z'
                      }
                    ],
                    Feeding: [
                      {
                        device_id: 'SS501',
                        status: true,
                        feed_time: '2026-11-03T03:00:00.000Z'
                      }
                    ]
                  }
                },
                noData: {
                  summary: '기록된 일지 없음',
                  value: {
                    exist: false,
                    message: '기록된 정보가 없습니다.'
                  }
                },
                futureDate: {
                  summary: '오늘 또는 미래 날짜 조회',
                  value: {
                    exist: false,
                    message: '아직 기록한 적이 없는 날짜입니다.'
                  }
                }
              }
            }
          }
        },
        400: {
          description: '날짜 파라미터 누락',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              },
              example: {
                message: '날짜를 입력해주세요'
              }
            }
          }
        },
        401: {
          description: '인증 실패'
        },
        403: {
          description: '등록된 어항 없음',
          content: {
            'application/json': {
              example: {
                message: '유저가 등록한 어항이 아닙니다.'
              }
            }
          }
        },
        500: {
          description: '서버 내부 오류',
          content: {
            'application/json': {
              example: {
                message: '서버에 오류가 발생하였습니다.'
              }
            }
          }
        }
      }
    }
  }
};
