
module.exports = {
  '/api/fishinfo': {
    get: {
      tags: ['FishInfo'],
      summary: '물고기 정보 조회',
      description: '로그인한 사용자의 어항에 등록된 물고기 정보를 조회합니다.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '물고기 정보 조회 성공',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fishInfo: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        fish_id: {
                          type: 'integer',
                          example: 1
                        },
                        device_id: {
                          type: 'string',
                          example: 'SS501'
                        },
                        fish_type: {
                          type: 'string',
                          example: '구피'
                        },
                        fish_count: {
                          type: 'integer',
                          example: 5
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: '인증 실패'
        },
        500: {
          description: '물고기 정보 조회 실패'
        }
      }
    },

    post: {
      tags: ['FishInfo'],
      summary: '물고기 정보 등록 및 수정',
      description: '기존에 등록된 물고기 정보를 모두 삭제하고 요청받은 물고기 목록으로 갱신합니다. 빈 배열을 전달하면 모든 물고기 정보가 삭제됩니다.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['fishes'],
              properties: {
                fishes: {
                  type: 'array',
                  description: '등록할 물고기 목록',
                  items: {
                    type: 'object',
                    required: ['fish_type', 'fish_count'],
                    properties: {
                      fish_type: {
                        type: 'string',
                        description: '물고기 종류',
                        example: '구피'
                      },
                      fish_count: {
                        type: 'integer',
                        description: '물고기 수',
                        minimum: 0,
                        example: 5
                      }
                    }
                  }
                }
              },
              example: {
                fishes: [
                  {
                    fish_type: '구피',
                    fish_count: 5
                  },
                  {
                    fish_type: '네온테트라',
                    fish_count: 10
                  }
                ]
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '물고기 정보 저장 성공',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: '물고기 정보 저장에 성공하셨습니다.'
                  }
                }
              }
            }
          }
        },
        400: {
          description: '잘못된 물고기 정보',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: '물고기 정보가 올바르지 않습니다.'
                  }
                }
              }
            }
          }
        },
        401: {
          description: '인증 실패'
        },
        500: {
          description: '물고기 정보 저장 실패'
        }
      }
    }
  }
};
