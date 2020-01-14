<template>
  <main id="pushMain">
    <HubHeader></HubHeader>

    <div id="testContentContainer">
      <div id="testHeaderBlock">
        <h1>Test push notifications</h1>
        <p>Send a test notification</p>
      </div>

      <div id="testFormBlock">
        <div class="testInputLabel">
          <label for="emailInput">
            Email:
          </label>

          <input
            type="email"
            id="emailInput"
            name="emailInput"
            placeholder="janedoe@something.com"
          />
        </div>

        <div class="testInputLabel">
          <label for="publicKeyInput">
            Public Key:
          </label>

          <input
            type="text"
            id="publicKeyInput"
            name="publickeyInput"
            placeholder="janedoe@something.com"
          />
        </div>

        <div class="testInputLabel">
          <label for="titleInput">
            Notification Title:
          </label>

          <input
            type="text"
            id="titleInput"
            name="titleInput"
            placeholder="Test Notification title"
          />
        </div>

        <div class="testInputLabel">
          <label for="bodyInput">
            Notification Body:
          </label>

          <input
            type="text"
            id="bodyInput"
            name="bodyInput"
            placeholder="Test Notification body"
          />
        </div>

        <div class="testInputLabel">
          <label for="iconInput">
            URL to notification icon:
          </label>

          <input type="text" id="iconInput" name="iconInput" placeholder="" />
        </div>
      </div>

      <div id="testActionBlock">
        <button>Send Test Notification</button>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";

import HubHeader from "~/components/HubHeader.vue";

@Component({
  components: {
    HubHeader
  }
})
export default class extends Vue {}
</script>

<style scoped>
#testContentContainer {
  padding-left: 3%;
  padding-right: 3%;

  margin-top: 46px;
}

#testContentContainer #testHeaderBlock h1 {
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: -0.02em;
  margin-bottom: 0px;
}

#testContentContainer #testHeaderBlock p {
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 28px;
}

#testFormBlock label {
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
}

#testFormBlock input {
  border: none;
  border-bottom: 1px solid rgba(60, 60, 60, 0.3);
  color: #3c3c3c;

  background: transparent;
  padding-bottom: 9px;
  width: 32em;
}

#testFormBlock .testInputLabel {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

#testActionBlock {
  width: 32em;
  display: flex;
  justify-content: flex-end;
}

#testActionBlock button {
  background: linear-gradient(90deg, #1fc2c8 0%, #9337d8 169.8%);
  border-radius: 20px;
  color: white;
  padding-top: 9px;
  padding-bottom: 10px;
  padding-left: 16px;
  padding-right: 16px;

  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
}
</style>
