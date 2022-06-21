<template>
    <div class="home">
        <b-container>
            <b-row>
                <b-col>
                    <div class="home_wrapper">
                        <h1>
                            AXwallet a secure crypto wallet for the
                            <br />
                            AXIA Network.
                        </h1>
                        <div class="login_wrapper">
                            <div class="login_option">
                                <header>
                                    <div class="img_container">
                                        <img
                                            v-if="$root.theme === 'day'"
                                            src="@/assets/DESIGN.png"
                                            alt
                                        />
                                        <img v-else src="@/assets/diamond-primary-night.svg" alt />
                                    </div>
                                    <h2>{{ $t('home.access.title') }}</h2>
                                    <p>{{ $t('home.access.desc') }}</p>
                                </header>
                                <div class="login_button">
                                    <router-link
                                        data-cy="access"
                                        to="/access"
                                        class="ava_button button_primary submit_but"
                                        :style="{ backgroundColor: '#178fe1 !important' }"
                                    >
                                        {{ $t('home.access.submit') }}
                                    </router-link>
                                </div>
                            </div>
                            <div class="login_option">
                                <header>
                                    <div class="img_container">
                                        <img
                                            v-if="$root.theme === 'day'"
                                            src="@/assets/DESIGN.png"
                                            alt
                                        />
                                        <img
                                            v-else
                                            src="@/assets/diamond-secondary-night.svg"
                                            alt
                                        />
                                    </div>
                                    <h2>{{ $t('home.create.title') }}</h2>
                                    <p>{{ $t('home.create.desc') }}</p>
                                </header>
                                <div class="login_button">
                                    <router-link
                                        data-cy="create"
                                        to="/create"
                                        class="ava_button button_secondary submit_but"
                                        :style="{
                                            backgroundColor: ' #35B994 !important',
                                            textAlign: 'center',
                                        }"
                                    >
                                        {{ $t('home.create.submit') }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <ToS class="tos" style="align-self: center; margin: 30px !important"></ToS>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import ToS from '@/components/misc/ToS.vue'

@Component({
    name: 'home',
    components: { ToS },
})
export default class Home extends Vue {}
</script>

<style scoped lang="scss">
@use "../main";

.home {
    padding-top: 100px;
    /*background-color: #fff;*/
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    background: linear-gradient(359.99deg, #fcfeff 16.91%, #e7f3fe 48.95%, #ffffff 99.99%);
    a {
        margin: 10px;
        text-align: center;
        display: block;
    }

    .home_wrapper {
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;

        h1 {
            text-align: center;
            font-size: 40px;
            font-weight: 500;
            color: #004373;
        }

        .login_wrapper {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0;
            text-align: center;
            background-color: #ffffff;
            margin: auto;
            box-shadow: 0px 4px 16px rgba(20, 92, 143, 0.08);
            width: 90%;
            .login_option {
                display: flex;
                flex-direction: column;
                border-radius: 2px;
                align-items: flex-start;
                justify-content: space-between;
                padding: 60px 90px main.$container-padding main.$container-padding;
                border-radius: 10px;
                .login_button {
                    margin: auto;
                }

                header {
                    margin-bottom: 60px;

                    img {
                        width: 89px;
                        height: 89px;
                        max-height: none;
                    }

                    h2 {
                        padding-top: main.$s-size;
                        font-family: 'DM Sans', sans-serif;
                        font-size: main.$s-size;
                        text-transform: uppercase;
                        color: var(--primary-color-light);
                    }

                    p {
                        margin-top: 10px !important;
                        font-size: main.$l-size;
                    }
                }

                a {
                    margin: 0;
                }
            }
        }
    }
}

.tos {
    margin-top: 14px !important;
}

.submit_but {
    width: max-content;
}
/* ==========================================
   Nav
   ========================================== */

@include main.night-mode {
}
.logo {
    margin-bottom: 30px;
}

img {
    max-height: 50px;
    object-fit: contain;
}

@include main.medium-device {
    .login_option {
        padding: 30px 40px !important;
        p {
            font-size: 1.4rem !important;
        }
    }
}

@include main.mobile-device {
    .auth {
        border-radius: 0;
        box-shadow: none;
    }

    .menu_option {
        padding: 5vh 12px;
    }
    .menu_option button {
        width: 100%;
        padding: 8px;
    }

    .imgcover {
        display: none;
    }

    .home {
        .home_wrapper {
            h1 {
                font-size: main.$xl-size-mobile;
            }

            .login_wrapper {
                grid-template-columns: none;
                display: flex;
                flex-direction: column;

                .login_option {
                    margin-bottom: main.$vertical-padding;
                    padding: 30px 15px;
                    align-items: center;

                    header {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        margin-bottom: 30px;

                        img {
                            width: 40px;
                            height: 40px;
                        }

                        h2 {
                            padding-top: main.$s-size-mobile;
                            font-size: main.$s-size-mobile;
                        }

                        p {
                            margin-top: 10px !important;
                            font-size: main.$l-size-mobile;
                            text-align: center;
                        }
                    }

                    a {
                        margin: 0;
                    }
                }
            }
        }
    }
}

@media only screen and (max-width: 600px) {
}
</style>
