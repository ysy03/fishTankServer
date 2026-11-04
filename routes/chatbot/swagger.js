
module.exports = {
  '/api/chatbot': {
    post: {
      tags: ['Chatbot'],
      summary: '챗봇 채팅방 생성 및 조회',
      description: '사용자의 채팅방이 없으면 새로 생성하고, 이미 존재하면 기존 채팅방 ID를 반환합니다.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '채팅방 생성 또는 조회 성공',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  chatid: {
                    type: 'integer',
                    description: '채팅방 고유 ID',
                    example: 1
                  }
                }
              },
              example: {
                chatid: 1
              }
            }
          }
        },
        401: {
          description: '인증 실패'
        },
        500: {
          description: '채팅방 생성 실패',
          content: {
            'application/json': {
              example: {
                message: '챗봇 생성에 실패하였습니다.'
              }
            }
          }
        }
      }
    }
  },

  '/api/chatbot/rooms/{id}': {
    get: {
      tags: ['Chatbot'],
      summary: '챗봇 대화 기록 조회',
      description: '사용자가 소유한 채팅방의 메시지를 생성 시간 오름차순으로 최대 20개 조회합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          description: '조회할 채팅방 ID',
          schema: {
            type: 'integer'
          },
          example: 1
        }
      ],
      responses: {
        200: {
          description: '채팅 기록 조회 성공',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    chatbotmessage_id: {
                      type: 'integer',
                      example: 1
                    },
                    chatbotroom_id: {
                      type: 'integer',
                      example: 1
                    },
                    user_id: {
                      type: 'integer',
                      example: 3
                    },
                    role: {
                      type: 'string',
                      enum: ['user', 'model'],
                      example: 'user'
                    },
                    message: {
                      type: 'string',
                      example: '구피의 적정 수온은 몇 도인가요?'
                    },
                    created_at: {
                      type: 'string',
                      format: 'date-time',
                      example: '2026-11-03T05:00:00.000Z'
                    }
                  }
                }
              },
              examples: {
                success: {
                  summary: '대화 기록 존재',
                  value: [
                    {
                      chatbotmessage_id: 1,
                      chatbotroom_id: 1,
                      user_id: 3,
                      role: 'user',
                      message: '구피의 적정 수온은 몇 도인가요?',
                      created_at: '2026-11-03T05:00:00.000Z'
                    },
                    {
                      chatbotmessage_id: 2,
                      chatbotroom_id: 1,
                      user_id: 3,
                      role: 'model',
                      message: '구피의 적정 수온은 일반적으로 24~28도입니다.',
                      created_at: '2026-11-03T05:00:03.000Z'
                    }
                  ]
                },
                empty: {
                  summary: '대화 기록 없음',
                  value: []
                }
              }
            }
          }
        },
        401: {
          description: '인증 실패'
        },
        403: {
          description: '채팅방 접근 권한 없음',
          content: {
            'application/json': {
              example: {
                message: '채팅방 주인이 아닙니다.'
              }
            }
          }
        },
        500: {
          description: '채팅 기록 조회 실패',
          content: {
            'application/json': {
              example: {
                message: '가져오는 것에 실패하였습니다.'
              }
            }
          }
        }
      }
    }
  },

  '/api/chatbot/rooms/{id}/message': {
    post: {
      tags: ['Chatbot'],
      summary: '챗봇 메시지 전송',
      description: '사용자가 입력한 메시지를 AI에 전달하고 생성된 답변을 반환합니다. 사용자 메시지와 AI 답변은 트랜잭션으로 저장됩니다.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          description: '메시지를 전송할 채팅방 ID',
          schema: {
            type: 'integer'
          },
          example: 1
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['message'],
              properties: {
                message: {
                  type: 'string',
                  description: 'AI 챗봇에 전달할 사용자 질문',
                  example: '구피에게 먹이는 하루에 몇 번 줘야 하나요?'
                }
              }
            },
            example: {
              message: '구피에게 먹이는 하루에 몇 번 줘야 하나요?'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'AI 답변 생성 성공',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'AI가 생성한 답변'
                  }
                }
              },
              example: {
                message: '구피는 일반적으로 하루 1~2회 먹이를 주는 것이 좋습니다. 먹이는 2~3분 안에 먹을 수 있는 양으로 급여하세요.'
              }
            }
          }
        },
        400: {
          description: '잘못된 메시지 또는 AI 답변 생성 실패',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string'
                  }
                }
              },
              examples: {
                emptyMessage: {
                  summary: '메시지 누락',
                  value: {
                    message: '답변을 제출해 주세요'
                  }
                },
                generationFailed: {
                  summary: 'AI 답변 생성 실패',
                  value: {
                    message: '답변이 생성되지 않았습니다.'
                  }
                }
              }
            }
          }
        },
        401: {
          description: '인증 실패'
        },
        403: {
          description: '채팅방 접근 권한 없음',
          content: {
            'application/json': {
              example: {
                message: '채팅방 주인이 아닙니다.'
              }
            }
          }
        },
        500: {
          description: '서버 내부 오류',
          content: {
            'application/json': {
              example: {
                message: '챗봇 답변 가져오는 것에 실패하였습니다.'
              }
            }
          }
        }
      }
    }
  }
};
