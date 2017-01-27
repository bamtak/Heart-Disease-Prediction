(function() {
	
	

    // Components

    // Pages
	
	
    var Login = Vue.extend({
        template: '#login',
        props: ['storage'],
        data: function () {
            return {
                username: '',
                password: '',
                error: false,
				registered : true
            };
        },
        methods: {
			enableRegister : function(e) {
				this.registered = false;
			},
			enableLogin : function(e) {
				this.registered = true;
			},
            login: function (e) {
                e.preventDefault();
                var component = this;
                Vue.http.get('/token', {}, {
                    headers: {
                        'Authorization': 'Basic ' + window.btoa(component.username + ':' + component.password)
                    }
                })
                .then(function(response) {
                    if(response.data.token) {
                        window.localStorage.webToken = response.data.token;
                        window.localStorage.webUser = component.username;
                        component.error = false;
                        Vue.http.get('/api/v1/hearttests', {}, {
						headers: {
                        'Authorization': 'Basic ' + window.btoa(window.localStorage.webToken + ':' + 'unused')
							}
						})
                        .then(function(response) {
                            if(response.data) {
                                component.storage.user.data.heartTests = response.data.hearttests;
                                router.go('/hearttests');
                            }
                        },
                        function(error) {
                            console.log(error);
							component.error = true;
                        });

                    } else {
                        component.error = true;
                    }
                },
                function (error) {
                    console.log('token retrieval failed');
					component.error = true;
                });
            },
			register : function(e) {
				e.preventDefault();
                var component = this;
					Vue.http.post('/users', {
                    username: component.username,
                    password: component.password
					})
					.then(function (response) {
						if(response.data.username == component.username) {
							Vue.http.get('/token', {}, {
								headers: {
									'Authorization': 'Basic ' + window.btoa(component.username + ':' + component.password)
								}
							})
							.then(function(response) {
								if(response.data.token) {
									window.localStorage.webToken = response.data.token;
									window.localStorage.webUser = component.username;
									component.error = false;
									router.go('/');
								} else {
									component.error = true;
								}
							},
							function (error) {
								console.log('token retrieval failed');
								component.error = true;
							});
						} else {
							console.log('the api may have changed');
							component.error = true;
						}
					},
					function (error) {
						console.log(error);
					});
                
			}
        }
    });

	
    var Sidebar = Vue.extend({
        template: '#sidebar',
        props: ['storage'],
		data: function() {
			return {
				user: window.localStorage.webUser
			}
		},
		methods: {
            logOut: function (e) {
                e.preventDefault();
                this.storage.userLoggedIn = false;
                this.storage.user.data.heartTests = [];
                delete window.localStorage.webToken;
                delete window.localStorage.webUser;
                router.go('/');
            }
        }
    });
	

    var Hearderh = Vue.extend({
        template: '#headerh',
        props: ['storage'],
        methods: {
            logOut: function (e) {
                e.preventDefault();
                this.storage.userLoggedIn = false;
                this.storage.user.data.heartTests = [];
                delete window.localStorage.webToken;
                delete window.localStorage.webUser;
                router.go('/');
            }
        }
    });

    var NewHeartTest = Vue.extend({
        template: '#newTest',
        props: ['storage'],
        data: function () {
            return {
				firstname: '',
				lastname: '',
				patientno: '',
                age : 0.0,
                sex : 0,
                cp : 0.0,
                trestbps : 0.0,
                chol : 0.0,
                fbs : 0.0,
                restecg : 0.0,
                thalach : 0.0,
                exang : 0.0,
                oldpeak : 0.0,
                slope : 0.0,
                ca : 0.0,
                thal : 0.0,
                result : 0
            };
        },
        methods: {
            addHeartTest: function (e) {
                e.preventDefault();
                var component = this;
				if (component.sex == "Male") {
					component.sex = 1;
				}
				else {
					component.sex = 0;
				}
				if (component.fbs!=1 && component.fbs !=0 && component.fbs > 120){
					component.fbs = 1;
				}
				if (component.fbs!=1 && component.fbs !=0 && component.fbs < 120) {
					component.fbs = 0;
				}
                Vue.http.post('/api/v1/hearttests', {
					firstname: component.firstname,
					lastname: component.lastname,
					patientno: component.patientno,
                    age : component.age,
                    sex : component.sex,
                    cp : component.cp,
                    trestbps : component.trestbps,
                    chol : component.chol,
                    fbs : component.fbs,
                    restecg : component.restecg,
                    thalach : component.thalach,
                    exang : component.exang,
                    oldpeak : component.oldpeak,
                    slope : component.slope,
                    ca : component.ca,
                    thal : component.thal
                },
                {
                    headers: {
                        'Authorization': 'Basic ' + window.btoa(window.localStorage.webToken + ':' + 'unused')
                    }
                })
                .then(function(response) {
                    if(response.data.id) {
						var HeartTest = {
                                firstname: response.data.firstname,
								lastname: response.data.lastname,
								patientno: response.data.patientno,
								id : response.data.id,
                                age : response.data.age,
                                sex : response.data.sex,
                                cp : response.data.cp,
                                trestbps : response.data.trestbps,
                                chol : response.data.chol,
                                fbs : response.data.fbs,
                                restecg : response.data.restecg,
                                thalach : response.data.thalach,
                                exang : response.data.exang,
                                oldpeak : response.data.oldpeak,
                                slope : response.data.slope,
                                ca : response.data.ca,
                                thal : response.data.thal,
                                result : response.data.result,
                                created_at : response.data.created_at
                            };
                        component.storage.user.data.heartTests.push(HeartTest);
						transition.to.params.id = response.data.id;
						router.go('/hearttests/'+response.data.id);
                    }
					
                },
                function (error) {
					if(response.data=='Unauthorized Access') {
						router.go('/');
					}
                });
            }
        },
		components: {
            headerh: Hearderh,
			sidebar: Sidebar
        }
    });
	
    var HeartTests = Vue.extend({
        template: '#allTests',
        props: ['storage'],
        data: function () {
            return {
                heartTests : this.storage.user.data.heartTests,
				filterKey : ""
            }
        },
		components: {
            headerh: Hearderh,
			sidebar: Sidebar
        }
		
    });

    var HeartTest = Vue.extend({
        template: '#testPage',
        props: ['storage'],
        route: {
            data: function (transition) {
                var heartTests = this.storage.user.data.heartTests;
                var index = null;
				this.id = transition.to.params.id;
                for(var i in heartTests) {
                    if(heartTests[i].id == this.id) {
                        index = i;
                        break;
                    }
                }
                if (index)
                    this.hearttest = this.storage.user.data.heartTests[index];
                transition.next();
            }
        },
        data: function () {
            return {
                hearttest: {},
				cp: {1:'Typical angina',2:'Atypical angina',3:'Non-anginal pain',4:'Asymptomatic'},
				thal: {3:'Normal',6:'Fixed Defect',7:'Reversable Defect'},
				restecg: {0:"Normal",1:"Having ST-T wave abnormality",2:"Showing probable or definite left ventricular hypertrophy by Estes' criteria"},
				slope : {1:'Upsloping',2:'Flat',3:'Downsloping'},
				id : null									
            };
        },
		components: {
            headerh: Hearderh,
			sidebar: Sidebar
        },
		methods : {
			createPDF : function(){
			   if (this.id) {
					Vue.http.get('/api/v1/download/hearttests/'+this.id, {}, {
							headers: {
								'Authorization': 'Basic ' + window.btoa(window.localStorage.webToken + ':' + 'unused')
							}
						})
						.then(function(response) {
						},
						function(error) {
							console.log(error);
						});
			   }
			}
		}
    });


    var Register = Vue.extend({
        template: '#register',
        data: function () {
            return {
                name: '',
                username: '',
                password: '',
                error: false
            };
        },
        methods: {
            register: function (e) {
                e.preventDefault();
                var component = this;
                Vue.http.post('/users', {
                    username: component.username,
                    password: component.password
                })
                .then(function (response) {
                    if(response.data.username == component.username) {
                        Vue.http.get('/token', {}, {
                            headers: {
                                'Authorization': 'Basic ' + window.btoa(component.username + ':' + component.password)
                            }
                        })
                        .then(function(response) {
                            if(response.data.token) {
                                window.localStorage.webToken = response.data.token;
                                window.localStorage.webUser = component.username;
                                component.error = false;
                                router.go('/');
                            } else {
                                component.error = true;
                            }
                        },
                        function (error) {
                            console.log('token retrieval failed');
                        });
                    } else {
                        console.log('the api may have changed');
                    }
                },
                function (error) {
                    console.log(error);
                });
            }
        }
    });

    var NotFound = Vue.extend({
        template: '#not-found'
    });

    // Router
    var Root = Vue.extend({
        beforeCompile: function () {
            var component = this;
            // make sure token is still valid and if it is, get user data
            Vue.http.get('/token',
            {},
            {
                headers: {
                    'Authorization': 'Basic ' + window.btoa(window.localStorage.webToken + ':' + 'unused')
                }
            })
            .then(function (response) {
                if(response.data.token) {
                    router.app.storage.userLoggedIn = true;
					window.localStorage.webToken = response.data.token;
                    Vue.http.get('/api/v1/hearttests', {}, {
						headers: {
							'Authorization': 'Basic ' + window.btoa(window.localStorage.webToken + ':' + 'unused')
						}
					})
                    .then(function(response) {
                        if(response.data && response.data.length > 0) {
                            component.storage.user.data.heartTests = response.data;
                        }
                    },
                    function(error) {
                        console.log(error);
                    });
                }
            },
            function (error) {
                router.go('/');
            });
        },
        data: function () {
            return {
                storage: {
                    user: {
                        info: {
                            name: window.localStorage.webUser
                        },
                        data: {
                            heartTests: [
                            ]
                        }
                    },
                    userLoggedIn: false
                }
            };
        }
    });

    var router = new VueRouter({
        hashbang: false,
        history: true
    });

    router.beforeEach(function (transition) {
        if (transition.to.auth || transition.to.path === '/') {
            // check if has token
            if(window.localStorage.webToken) {
                // make sure token is still valid and if it is, get user data
                Vue.http.get('/api/v1/users/'+window.localStorage.webUser,{},
                {
                    headers: {
                        'Authorization': 'Basic ' + window.btoa(window.localStorage.webToken + ':' + 'unused')
                    }
                })
                .then(function (response) {
                    if(response.data.username) {
                        if(!router.app.storage.userLoggedIn) {
                            router.app.storage.userLoggedIn = true;
                        }

                        transition.next();
                    } else {
                        delete window.localStorage.webToken;
                        delete window.localStorage.webUser;
                        if(router.app.storage.userLoggedIn) {
                            router.app.storage.userLoggedIn = false;
                        }

                        transition.redirect('/');
                    }

                },
                function (error) {
                    console.log(error);
                });
            } else {
                transition.next();
            }
        } else {
            transition.next()
        }
    });

    router.map({
        '/': {
            name: 'login',
            component: Login
        },
        '/hearttests': {
            name: 'hearttests',
            component: HeartTests,
            auth: true
        },
        '/hearttests/:id': {
            name: 'hearttest',
            component: HeartTest,
            auth: true
        },
		'/newhearttest': {
            name: 'newhearttest',
            component: NewHeartTest,
            auth: true
        },
        '/register': {
            name: 'register',
            component: Register
        },
        '/404': {
            name: '404',
            component: NotFound
        }
    });

    router.start(Root, '#app');
})();
