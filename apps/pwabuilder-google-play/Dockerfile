# ─── PRELIMINAR: Ubuntu base con Android/Java toolchain ───────────────────────
# Optional overrides for build environments that cannot reach Docker Hub or archive.ubuntu.com, for example
#   --build-arg UBUNTU_IMAGE=mcr.microsoft.com/mirror/docker/library/ubuntu:24.04
#   --build-arg UBUNTU_MIRROR_HOST=azure.archive.ubuntu.com
# Leave them unset to use the defaults.
ARG UBUNTU_IMAGE=ubuntu:24.04
FROM --platform=linux/amd64 ${UBUNTU_IMAGE}  AS ubuntu

ARG ANDROID_SDK_TOOLS_VERSION="15641748"
ARG NODE_VERSION="24.x"
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
ARG UBUNTU_MIRROR_HOST=
WORKDIR ${DIRWORK}

RUN if [ -n "$UBUNTU_MIRROR_HOST" ]; then \
      for f in /etc/apt/sources.list /etc/apt/sources.list.d/*.sources /etc/apt/sources.list.d/*.list; do \
        if [ -f "$f" ]; then sed -i -e "s#//archive.ubuntu.com#//${UBUNTU_MIRROR_HOST}#g" -e "s#//security.ubuntu.com#//${UBUNTU_MIRROR_HOST}#g" "$f"; fi; \
      done; \
    fi

RUN echo export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-$(uname -m)/" >> /etc/jdk.env && \
    echo . /etc/jdk.env >> /etc/bash.bashrc && echo . /etc.jdk.env >> /etc/profile && \
    apt-get update -qq && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -qq --no-install-recommends \
    apt-utils locales unzip curl git build-essential openjdk-11-jdk openjdk-17-jdk \
    wget zip zipalign ruby-full tzdata && \
    locale-gen $LANG && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*


FROM pre-base AS base

RUN set +e; \
    echo "=== network probes (HEAD, follows redirects, 20s limit each)"; \
    for u in \
      "https://dl.google.com/android/repository/repository2-3.xml" \
      "https://dl.google.com/android/repository/addons_list-5.xml" \
      "https://dl.google.com/android/repository/platform-tools-latest-linux.zip" \
      "https://repo1.maven.org/maven2/org/apache/commons/commons-lang3/3.18.0/commons-lang3-3.18.0.jar" \
      "https://repo1.maven.org/maven2/com/google/guava/guava/33.7.2-jre/guava-33.7.2-jre.jar" \
      "https://deb.nodesource.com/setup_24.x" \
      "https://ms-feed-2.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/" ; do \
      out=$(curl -sSIL -m 20 -o /dev/null -w 'http=%{http_code} final=%{url_effective}' "$u" 2>&1); rc=$?; \
      echo "rc=$rc $out <= $u"; \
    done; \
    echo "=== sdkmanager (Java) probe, 120s limit"; \
    wget --quiet -O /tmp/t.zip "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_TOOLS_VERSION}_latest.zip"; \
    unzip -q /tmp/t.zip -d /tmp/t; \
    timeout 120 /tmp/t/cmdline-tools/bin/sdkmanager --sdk_root=/tmp/sdk --verbose --list > /tmp/list.log 2>&1; \
    echo "sdkmanager exit code: $?"; \
    tail -40 /tmp/list.log; \
    echo "=== probes finished; failing on purpose so the build stops here"; \
    exit 1

# Install the Android SDK, then remediate the vulnerable jars that ship inside the
# Android Lint payload bundled in cmdline-tools. Container scanners keep flagging
# these and Google's cmdline-tools releases keep bundling them, so a version bump
# alone doesn't clear the findings.
#   * lib/external/lint-psi bundles an old protobuf-java (2.6.1) and
#     jline-remote-telnet (3.24.1) inside its Kotlin compiler. It is only used by
#     `lint`, which CloudAPK (Bubblewrap + Gradle) never runs, so we delete it.
#     sdkmanager keeps its own protobuf-java 3.25.5 elsewhere in lib/external.
#   * commons-lang3 3.16.0 is referenced by sdkmanager's Class-Path manifest, so we
#     overwrite it in place with the patched 3.18.0 (API-compatible). The 3.16.0
#     filename is kept intentionally so every bundled *-classpath.jar manifest still
#     resolves it; scanners read the jar's internal metadata and see 3.18.0.
#   * Guava is updated in place to 33.7.2-jre for GHSA-xxph-c9ww-hj94,
#     preserving the SDK's manifest references in the same way.
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
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;36.1.0" && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;35.0.0" && \
    echo yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0" && \
    echo yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses && \
    rm -rf "$ANDROID_HOME/cmdline-tools/latest/lib/external/lint-psi" && \
    wget --quiet -O "$ANDROID_HOME/cmdline-tools/latest/lib/external/org/apache/commons/commons-lang3/3.16.0/commons-lang3-3.16.0.jar" \
    "https://repo1.maven.org/maven2/org/apache/commons/commons-lang3/3.18.0/commons-lang3-3.18.0.jar" && \
    wget --quiet -O "$ANDROID_HOME/cmdline-tools/latest/lib/external/com/google/guava/guava/33.3.1-jre/guava-33.3.1-jre.jar" \
    "https://repo1.maven.org/maven2/com/google/guava/guava/33.7.2-jre/guava-33.7.2-jre.jar" && \
    echo "b530942257fb935f8b2cfaa5f8eb5bd59c555fd8e8d01b8ce98912e077ea606c  $ANDROID_HOME/cmdline-tools/latest/lib/external/com/google/guava/guava/33.3.1-jre/guava-33.3.1-jre.jar" | sha256sum -c -


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
    apt-get update -qq && \
    apt-get install -qq nodejs=24.22.3-1nodesource1 yarn && \
    rm -rf /var/lib/apt/lists/*

FROM node-final AS builder
ARG NPM_CONFIG_REGISTRY=https://ms-feed-2.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/
ARG NPM_CONFIG_REPLACE_REGISTRY_HOST=always
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY . .

ENV NODE_ENV=development
RUN npm ci --ignore-scripts
RUN npm run build
RUN ls -la /app/server.*

FROM builder AS app
WORKDIR /app

RUN npm prune --omit=dev --ignore-scripts && \
    npm_root="$(npm root -g)" && \
    rm -rf "$npm_root/npm" /usr/bin/npm /usr/bin/npx

ENV NODE_ENV=production
ENV PORT=5858
EXPOSE 5858

CMD ["node", "./server.js"]
