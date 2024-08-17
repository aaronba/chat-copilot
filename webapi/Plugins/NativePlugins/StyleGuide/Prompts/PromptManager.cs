// Copyright (c) Microsoft. All rights reserved.

namespace CopilotChat.WebApi.Plugins.NativePlugins.StyleGuide.Prompts;

internal struct PromptManager
{

    internal const string SYSTEM_PROMPT_TEMPLATE = """
        Use the below JSON Schema to generate COSMOS DB SQL query.
        Must Flatten the children array using JOIN... IN syntax.
        It must be accurate and valid.
        MUST use unique aliases for each table.
        Must evaluate the generated sql against the schema for accuracy.
        Must not provide any explanations.

        Table: {{tableName}}
        ChunkIndex starts from 1.
        Schema:
        {
          "$schema": "http://json-schema.org/draft-04/schema#",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "createdOn": {
              "type": "string"
            },
            "fileName": {
              "type": "string"
            },
            "numberOfChunks": {
              "type": "integer"
            },
            "chunks": {
              "type": "array",
              "items": [
                {
                  "type": "object",
                  "properties": {
                    "chunkId": {
                      "type": "string"
                    },
                    "chunkIndex": {
                      "type": "integer"
                    },
                    "originalText": {
                      "type": "string"
                    },
                    "finalSuggestedText": {
                      "type": "string"
                    },
                    "details": {
                      "type": "array",
                      "items": [
                        {
                          "type": "object",
                          "properties": {
                            "originalText": {
                              "type": "string"
                            },
                            "suggestedText": {
                              "type": "string"
                            },
                            "ruleCount": {
                              "type": "integer"
                            },
                            "rulesApplied": {
                              "type": "array",
                              "items": [
                                {
                                  "type": "object",
                                  "properties": {
                                    "url": {
                                      "type": "string"
                                    },
                                    "title": {
                                      "type": "string"
                                    },
                                    "rules": {
                                      "type": "array",
                                      "items": [
                                        {
                                          "type": "object",
                                          "properties": {
                                            "rule": {
                                              "type": "string"
                                            }
                                          },
                                          "required": [
                                            "rule"
                                          ]
                                        }
                                      ]
                                    }
                                  },
                                  "required": [
                                    "url",
                                    "title",
                                    "rules"
                                  ]
                                }
                              ]
                            }
                          },
                          "required": [
                            "originalText",
                            "suggestedText",
                            "ruleCount",
                            "rulesApplied"
                          ]
                        },
                        {
                          "type": "object",
                          "properties": {
                            "originalText": {
                              "type": "string"
                            },
                            "suggestedText": {
                              "type": "string"
                            },
                            "ruleCount": {
                              "type": "integer"
                            },
                            "rulesApplied": {
                              "type": "array",
                              "items": [
                                {
                                  "type": "object",
                                  "properties": {
                                    "url": {
                                      "type": "string"
                                    },
                                    "title": {
                                      "type": "string"
                                    },
                                    "rules": {
                                      "type": "array",
                                      "items": [
                                        {
                                          "type": "object",
                                          "properties": {
                                            "rule": {
                                              "type": "string"
                                            }
                                          },
                                          "required": [
                                            "rule"
                                          ]
                                        }
                                      ]
                                    }
                                  },
                                  "required": [
                                    "url",
                                    "title",
                                    "rules"
                                  ]
                                }
                              ]
                            }
                          },
                          "required": [
                            "originalText",
                            "suggestedText",
                            "ruleCount",
                            "rulesApplied"
                          ]
                        },
                        {
                          "type": "object",
                          "properties": {
                            "originalText": {
                              "type": "string"
                            },
                            "suggestedText": {
                              "type": "string"
                            },
                            "ruleCount": {
                              "type": "integer"
                            },
                            "rulesApplied": {
                              "type": "array",
                              "items": [
                                {
                                  "type": "object",
                                  "properties": {
                                    "url": {
                                      "type": "string"
                                    },
                                    "title": {
                                      "type": "string"
                                    },
                                    "rules": {
                                      "type": "array",
                                      "items": [
                                        {
                                          "type": "object",
                                          "properties": {
                                            "rule": {
                                              "type": "string"
                                            }
                                          },
                                          "required": [
                                            "rule"
                                          ]
                                        }
                                      ]
                                    }
                                  },
                                  "required": [
                                    "url",
                                    "title",
                                    "rules"
                                  ]
                                }
                              ]
                            }
                          },
                          "required": [
                            "originalText",
                            "suggestedText",
                            "ruleCount",
                            "rulesApplied"
                          ]
                        }
                      ]
                    }
                  },
                  "required": [
                    "chunkId",
                    "chunkIndex",
                    "originalText",
                    "finalSuggestedText",
                    "details"
                  ]
                },
                {
                  "type": "object",
                  "properties": {
                    "chunkId": {
                      "type": "string"
                    },
                    "chunkIndex": {
                      "type": "integer"
                    },
                    "originalText": {
                      "type": "string"
                    },
                    "finalSuggestedText": {
                      "type": "string"
                    },
                    "details": {
                      "type": "array",
                      "items": [
                        {
                          "type": "object",
                          "properties": {
                            "originalText": {
                              "type": "string"
                            },
                            "suggestedText": {
                              "type": "string"
                            },
                            "ruleCount": {
                              "type": "integer"
                            },
                            "rulesApplied": {
                              "type": "array",
                              "items": [
                                {
                                  "type": "object",
                                  "properties": {
                                    "url": {
                                      "type": "string"
                                    },
                                    "title": {
                                      "type": "string"
                                    },
                                    "rules": {
                                      "type": "array",
                                      "items": [
                                        {
                                          "type": "object",
                                          "properties": {
                                            "rule": {
                                              "type": "string"
                                            }
                                          },
                                          "required": [
                                            "rule"
                                          ]
                                        }
                                      ]
                                    }
                                  },
                                  "required": [
                                    "url",
                                    "title",
                                    "rules"
                                  ]
                                }
                              ]
                            }
                          },
                          "required": [
                            "originalText",
                            "suggestedText",
                            "ruleCount",
                            "rulesApplied"
                          ]
                        },
                        {
                          "type": "object",
                          "properties": {
                            "originalText": {
                              "type": "string"
                            },
                            "suggestedText": {
                              "type": "string"
                            },
                            "ruleCount": {
                              "type": "integer"
                            },
                            "rulesApplied": {
                              "type": "array",
                              "items": [
                                {
                                  "type": "object",
                                  "properties": {
                                    "url": {
                                      "type": "string"
                                    },
                                    "title": {
                                      "type": "string"
                                    },
                                    "rules": {
                                      "type": "array",
                                      "items": [
                                        {
                                          "type": "object",
                                          "properties": {
                                            "rule": {
                                              "type": "string"
                                            }
                                          },
                                          "required": [
                                            "rule"
                                          ]
                                        }
                                      ]
                                    }
                                  },
                                  "required": [
                                    "url",
                                    "title",
                                    "rules"
                                  ]
                                }
                              ]
                            }
                          },
                          "required": [
                            "originalText",
                            "suggestedText",
                            "ruleCount",
                            "rulesApplied"
                          ]
                        },
                        {
                          "type": "object",
                          "properties": {
                            "originalText": {
                              "type": "string"
                            },
                            "suggestedText": {
                              "type": "string"
                            },
                            "ruleCount": {
                              "type": "integer"
                            },
                            "rulesApplied": {
                              "type": "array",
                              "items": [
                                {
                                  "type": "object",
                                  "properties": {
                                    "url": {
                                      "type": "string"
                                    },
                                    "title": {
                                      "type": "string"
                                    },
                                    "rules": {
                                      "type": "array",
                                      "items": [
                                        {
                                          "type": "object",
                                          "properties": {
                                            "rule": {
                                              "type": "string"
                                            }
                                          },
                                          "required": [
                                            "rule"
                                          ]
                                        }
                                      ]
                                    }
                                  },
                                  "required": [
                                    "url",
                                    "title",
                                    "rules"
                                  ]
                                }
                              ]
                            }
                          },
                          "required": [
                            "originalText",
                            "suggestedText",
                            "ruleCount",
                            "rulesApplied"
                          ]
                        }
                      ]
                    }
                  },
                  "required": [
                    "chunkId",
                    "chunkIndex",
                    "originalText",
                    "finalSuggestedText",
                    "details"
                  ]
                }
              ]
            },
            "_rid": {
              "type": "string"
            },
            "_self": {
              "type": "string"
            },
            "_etag": {
              "type": "string"
            },
            "_attachments": {
              "type": "string"
            },
            "_ts": {
              "type": "integer"
            }
          },
          "required": [
            "id",
            "createdOn",
            "fileName",
            "numberOfChunks",
            "chunks",
            "_rid",
            "_self",
            "_etag",
            "_attachments",
            "_ts"
          ]
        }
        """;


    internal const string SYSTEM_PROMPT_FEW_SHOT_EXAMPLES = """


    [
        {
            "user":"give me all the original text",
            "assistant":"SELECT  c.originalText FROM results r JOIN c in r.chunks"
        }

    ]


    """;

}
