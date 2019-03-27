<template>
  <Auth 
    :on-failed-authentication="onFailedAuthentication" 
    @loggedIn="onLoggedIn">
    <v-app>
      <v-content>
        <v-container 
          fluid 
          fill-height>
          <v-layout 
            align-center 
            justify-center>
            <v-flex 
              xs12 
              sm8 
              md4 
              class="text-xs-center fc">
              <!--img src="../assets/pickll_logo_row.svg"-->
              <v-progress-circular 
                v-if="loggingIn"
                :size="50"
                color="primary"
                indeterminate
                class="mt-3 fc"
              />
              <FirebaseSignInUi v-else/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>
  </Auth>
</template>

<script>
import FirebaseSignInUi from '@/components/sign-in/firebase-sign-in-ui'
import Auth from '@/components/auth'
export default {
  components: {
    FirebaseSignInUi,
    Auth
  },
  data() {
    return {
      loggingIn: true
    }
  },
  methods: {
    onFailedAuthentication() {
      this.loggingIn = false;
    },
    onLoggedIn({ onboardingData }) {

      this.$router.push('/top');

      /*
      if (!!onboardingData) {
        this.$router.push('/create-page')
      } else {
        this.$router.push('/user-onboarding')
      }
      */
    }
  }
}
</script>

<style>
img {
  width: 100%;
}

.v-btn__content {
  justify-content: flex-start;
}

.v-icon {
  width: 50px;
}
</style>
