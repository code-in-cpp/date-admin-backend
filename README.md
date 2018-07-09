# Asstbot

## msg from client

```js
const textMsg = {
    from : {
        id : 'xxxxx'
    },
    type : 'text',
    data : {
        query : 'hello'
    }
};

const imageMsg = {
    from : {
        id : 'xxxxx'
    },
    type : 'image',
    data : {
        url : 'http://localhost:8000/test.jpg',
        indicator : 'profile'
    }
};

const loginMsg = {
    from : {
        id : 'xxxxx'
    },
    type : 'login',
    data : {
        code : '12345'
    }
};

const dateMsg = {
	from : {
		id : 'xxxxx'
	},
	type : 'date',
	data : {
		value : "2018年7月9日",
		indicator : 'now',  // optional
		nlu : true // optional
	}
}
```

### msg to client

```js
const reply = {
    to : {
        id : userId
    },
    msgs : [
        // msg defined in below
    ]    
}
```

```js
// msgs

{
    type : 'text',
    reply: '你好，主人'
}

{
    type : 'radio',
    title : '您是男的还是女的呢？',  // optional
    items : [
        { caption : '男', 
          value : '我是男的'  // optional
        },
        { caption : '女', 
          value : '我是女的' // optional
        }
    ]
}

{
    type  : 'checkbox',
	title : '我爱吃以下哪些东东呢？',  // optional
	prefix: '我爱吃：', // optional
	split : '，', // optional, default : ','
	postfix: '的呀！', // optional
    items : [
        { caption : '水饺'},
        { caption : '牛排'},
        { caption : '沙拉'},
        { caption : '披萨'},
        { caption : '凉皮'}
    ]
}

{
    type : 'image',
    title : '头像', // optional
    url : 'http://localhost:8000/test.jpg',
    width : 150, // optional
    height: 100 // optional
}

{
    type : 'imageUploader',
    title: '请上传您的背景图', // optional
    indicator : 'profile',
    explicit  : false // optional
}

{
    type : 'numberList',
    title : '请选择名次：',  // optional
    min   : 0,
    max   : 100,
    prefix: '第',  // optional
    postfix: '名',  // optional
    chinese: true, // optional
}

{
	type : 'dialog-end'
}

{
	type : 'date-picker',
	indicator : 'now',
	nlu : true
}

```

## Survey

### exam

```json
{
    "survey" : {
    	"userId" : "bowen",
    	"type"   : "exam",
		"title"  : "看看你有多了解我？",
		"intro"  : "Hello, 好朋友们，回答下面的问题，来看看你们有多了解我吧",
		"avatarUrl" : "http://localhost:8000/profile.jpg",
    	"subjects" : [
    		{ 
    			"id" : 1,
    			"type" : "radio",
    			"question" : "我是哪个星座的？",
    			"answers" : [
    				{
    					"value" : "白羊座",
    					"correct" : true
    				},
    				{
    					"value" : "金牛座"
    				},
    				{
    					"value" : "处女座"
    				},
    				{
    					"value" : "射手座"
    				}     				
    			]
    		
    		},
    		{ 
    			"id" : 2,
    			"type" : "checkbox",
    			"question" : "我喜欢吃以下哪些东西？",
    			"answers" : [
    				{
    					"value" : "油泼面",
    					"correct" : false
    				},
    				{
    					"value" : "牛排",
    					"correct" : true
    				},
    				{
    					"value" : "沙拉",
    					"correct" : true
    				},
    				{
    					"value" : "水饺",
    					"correct" : false
    				}     				
    			]
    		
    		},
    		{ 
    			"id" : 3,
    			"type" : "text",
				"question" : "用一个词语形容一下我吧",
    			"answers" : [
    				{
    					"value" : "天真"
					},
    				{
    					"value" : "幼稚"
					}
				]				
			},
			{
				"id" : 4,
				"type" : "date",
				"nlu" : true,
				"question" : "说说我的生日吧？",
				"answers" : [
					{
						"value" : "1983年1月17日"
					}
				]
			}
    	],
    	"conclusions" : [
    		{
    			"scoreRange" : {
    				"min" : 0,
    				"max" : 2
    			},
    			"text" : "看来你对我还不是很了解啊，可能我是发错人了吧~"
    		},
    		{
    			"scoreRange" : {
    				"min" : 2,
    				"max" : 4
    			},
    			"text" : "你对我的了解让我吃惊，你绝对是我的好基友！"
    		}
    	]
    }
}
```

### exam result

```json
{
	"surveyResult" : {
		"surveyId" : "survey-652ea4d0-7dad-11e8-abe8-abb0bd666421",
		"responder": {
			"userId" : "xxxxxxx",
			"nickName" : "xiaowei",
			"avatarUrl": "http://localhost:8000/profile.png"
		},
		"answers"  : [
			{
				"id"    : 1,
				"result": [ {"value" : "白羊座", "correct" : true} ]
			},
			{
				"id"    : 2,
				"result": [ {"value" : "油泼面", "correct" : false}, {"value" : "牛排", "correct" : true} ]
			},
			{
				"id"    : 3,
				"result": [ {"value" : "天真", "correct" : true} ]
			},
			{
				"id"    : 4,
				"result": [ {"value" : "1983-1-27", "correct" : true} ]
			}		
		],
		"score"    : 3
	}
}
```

### inquiry

```json
{
    "survey" : {
    	"userId" : "bowen",
    	"type"   : "inquiry",
		"title"  : "你希望公司为员工提供哪些福利？",
		"intro"  : "公司为大家做福利计划，快来回答你希望公司提供的福利内容吧",
		"avatarUrl" : "http://localhost:8000/profile.jpg",
    	"subjects" : [
    		{ 
    			"id" : 1,
    			"type" : "radio",
    			"question" : "你来公司多久了？",
    			"answers" : [
    				{
    					"value" : "少于1年"
    				},
    				{
    					"value" : "1到3年"
    				},
    				{
    					"value" : "3到5年"
    				},
    				{
    					"value" : "5年以上"
    				}     				
    			]
    		
    		},
    		{ 
    			"id" : 2,
    			"type" : "checkbox",
    			"question" : "以下哪些方面的福利改进，你觉得会提升公司竞争力",
    			"answers" : [
    				{
    					"value" : "零食"
    				},
    				{
    					"value" : "活动"
    				},
    				{
    					"value" : "奖励"
    				},
    				{
    					"value" : "保险"
    				}     				
    			]
    		
    		},
    		{ 
    			"id" : 3,
    			"type" : "text",
				"question" : "说说你最希望公司提供的具体福利计划吧",
    			"answers" : []				
    		}
    	],
    	"conclusions" : [
    		{
    			"text" : "感谢您的回复，我们会认真考虑您的建议！"
    		}
    	]
    }
}
```

### inquiry result

```json
{
	"surveyResult" : {
		"surveyId" : "survey-652ea4d0-7dad-11e8-abe8-abb0bd666421",
		"responder": {
			"userId" : "xxxxxxx",
			"nickName" : "xiaowei",
			"avatarUrl": "http://localhost:8000/profile.png"
		},
		"answers"  : [
			{
				"id"    : 1,
				"result": [ {"value" : "少于1年"} ]
			},
			{
				"id"    : 2,
				"result": [ {"value" : "零食"}, {"value" : "保险"} ]
			},
			{
				"id"    : 3,
				"result": [ {"value" : "我最希望公司能够提供住宿补贴"} ]
			}			
		]
	}
}
```

### poll

```json
{
    "survey" : {
    	"userId" : "bowen",
    	"type"   : "poll",
		"title"  : "公司秋游目的地投票",
		"intro"  : "公司组织秋游，快来选选你最想去哪里吧",
		"avatarUrl" : "http://localhost:8000/profile.jpg",
    	"subjects" : [
    		{ 
    			"id" : 1,
    			"type" : "single-choice",
    			"question" : "以下目的地你最想去哪里呢？",
    			"answers" : [
    				{
    					"value" : "张家界",
    				},
    				{
    					"value" : "莫干山"
    				},
    				{
    					"value" : "壶口瀑布"
    				},
    				{
    					"value" : "东方明珠"
    				}     				
    			]
    		
    		}
    	]
    }
}
```

### poll result

```json
{
	"surveyResult" : {
		"surveyId" : "survey-652ea4d0-7dad-11e8-abe8-abb0bd666421",
		"responder": {
			"userId" : "xxxxxxx",
			"nickName" : "xiaowei",
			"avatarUrl": "http://localhost:8000/profile.png"
		},
		"answers"  : [
			{
				"id"    : 1,
				"result": [ {"value" : "东方明珠"} ]
			}			
		]
	}
}
```

### statistic

```js
{
	"surveyId" : "survey-652ea4d0-7dad-11e8-abe8-abb0bd666421",
	"subjects" : [
    		{ 
    			"id" : 1,
    			"answers" : [
    				{
						"value" : "少于1年",
						"count" : 5
    				},
    				{
						"value" : "1到3年",
						"count" : 10
    				},
    				{
						"value" : "3到5年",
						"count" : 0
    				},
    				{
						"value" : "5年以上",
						"count" : 2
    				}     				
    			]
    		
    		},
    		{ 
    			"id" : 2,
    			"answers" : [
    				{
						"value" : "零食",
						"count" : 0
    				},
    				{
						"value" : "活动",
						"count" : 1
    				},
    				{
						"value" : "奖励",
						"count" : 2
    				},
    				{
						"value" : "保险",
						"count" : 7
    				}     				
    			]
    		
    		}
    	]	
}
```

## qrcode

### node-canvas install

```bash
ubuntu: sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

mac: brew install pkg-config cairo pango libpng jpeg giflib
```

```bash
npm install canvas
```