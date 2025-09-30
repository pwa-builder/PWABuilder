# ─── PRELIMINAR: Ubuntu base con Android/Java toolchain ───────────────────────
FROM --platform=linux/amd64 ubuntu:20.04  AS ubuntu

ARG ANDROID_SDK_TOOLS_VERSION="11076708"
ARG NODE_VERSION="20.x"
ARG JENV_RELEASE="0.5.6"

ARG DIRWORK="/tmp"
ARG SDK_PACKAGES_LIST="${DIRWORK}/packages.txt"

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=${JAVA_HOME}/bin:${PATH}

ENV ANDROID_HOME="/opt/android-sdk" \
    ANDROID_SDK_HOME="/opt/android-sdk" \
    ANDROID_NDK="/opt/android-sdk/ndk/latest" \
    ANDROID_NDK_ROOT="/opt/android-sdk/ndk/latest" \
    FLUTTER_HOME="/opt/flutter" \
    JENV_ROOT="/opt/jenv" \
    ANDROID_SDK_MANAGER=/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager \
    TZ=America/Los_Angeles \
    LANG="en_US.UTF-8" \
    LANGUAGE="en_US.UTF-8" \
    LC_ALL="en_US.UTF-8"

ENV PATH="${JENV_ROOT}/shims:${JENV_ROOT}/bin:$JAVA_HOME/bin:$PATH:$ANDROID_SDK_HOME/emulator:$ANDROID_SDK_HOME/cmdline-tools/latest/bin:$ANDROID_SDK_HOME/tools:$ANDROID_SDK_HOME/platform-tools:$ANDROID_NDK:$FLUTTER_HOME/bin:$FLUTTER_HOME/bin/cache/dart-sdk/bin"

FROM ubuntu AS pre-base
ARG TERM=dumb
ARG DEBIAN_FRONTEND=noninteractive
WORKDIR ${DIRWORK}

RUN echo export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-$(uname -m)/" >> /etc/jdk.env && \
    echo . /etc/jdk.env >> /etc/bash.bashrc && echo . /etc.jdk.env >> /etc/profile && \
    apt-get update -qq && \
    apt-get install -qq --no-install-recommends \
    apt-utils locales unzip curl git git-lfs build-essential openjdk-11-jdk openjdk-17-jdk \
    wget zip zipalign ruby-full python3-pip tzdata && \
    locale-gen $LANG && \
    git lfs install && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*


FROM pre-base AS base

RUN wget --quiet -O sdk-tools.zip \
    "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_TOOLS_VERSION}_latest.zip" && \
    mkdir -p "$ANDROID_HOME/cmdline-tools" && \
    unzip -q sdk-tools.zip -d "$ANDROID_HOME/cmdline-tools" && \
    rm sdk-tools.zip && \
    mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest" && \
    echo yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-31" && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-36" && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;35.0.0" && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0" && \
    echo yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses


FROM base AS jenv-base
RUN git clone --depth 1 --branch ${JENV_RELEASE} https://github.com/jenv/jenv.git ${JENV_ROOT} && \
    echo 'eval "$(jenv init -)"' >> ~/.bash_profile && \
    . ~/.bash_profile && . /etc/jdk.env && \
    jenv add /usr/lib/jvm/java-11-openjdk-$(uname -m) && \
    jenv add /usr/lib/jvm/java-17-openjdk-$(uname -m) && \
    jenv global 17.0


FROM base AS pre-minimal
RUN mkdir -p "$ANDROID_HOME"/.android && \
    echo '### User Sources for Android SDK Manager' > "$ANDROID_HOME"/.android/repositories.cfg && \
    echo yes | ${ANDROID_SDK_MANAGER} --licenses > /dev/null && \
    ${ANDROID_SDK_MANAGER} --list > ${SDK_PACKAGES_LIST}


FROM pre-minimal AS node-final
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - && \
    apt-get update -qq && apt-get install -qq nodejs yarn && \
    npm install -g bower cordova eslint gulp-cli @ionic/cli mocha node-gyp

FROM node-final AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY . .

ENV NODE_ENV=development
RUN npm install
RUN npm run build
RUN ls -la /app/server.*

FROM builder AS app
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app .

ENV PORT=5858
EXPOSE 5858

CMD npm start