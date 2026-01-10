# Usa a imagem oficial do Node (LTS)
FROM node:20-slim

# Instala dependências básicas do sistema e o ZSH (já que você pediu no command)
RUN apt-get update && apt-get install -y \
    git \
    zsh \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------
# Instalar Oh My Zsh e tema lambda-gitster
# ----------------------------
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
RUN sed -i '1i ZSH_DISABLE_COMPFIX="true"' /root/.zshrc

RUN git clone https://github.com/ergenekonyigit/lambda-gitster.git /tmp/lambda-gitster && \
    cp /tmp/lambda-gitster/lambda-gitster.zsh-theme /root/.oh-my-zsh/custom/themes/ && \
    rm -rf /tmp/lambda-gitster

RUN git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
    /root/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting && \
    git clone https://github.com/zsh-users/zsh-autosuggestions.git \
    /root/.oh-my-zsh/custom/plugins/zsh-autosuggestions && \
    git clone https://github.com/supercrabtree/k \
    /root/.oh-my-zsh/custom/plugins/k

RUN sed -i 's/ZSH_THEME=".*"/# ZSH_THEME="robbyrussell"\n# ZSH_THEME="powerlevel10k\/powerlevel10k"\nZSH_THEME="lambda-gitster"/' /root/.zshrc && \
    sed -i 's/plugins=(git)/plugins=(git zsh-syntax-highlighting zsh-autosuggestions k)/' /root/.zshrc

# Carregar NVM no zshrc do root
RUN echo '\n# NVM setup' >> /root/.zshrc \
    && echo 'export NVM_DIR="$HOME/.nvm"' >> /root/.zshrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /root/.zshrc \
    && echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /root/.zshrc

# Configura aliases no zshrc do root
RUN echo 'alias ppelist="echo \"ppegit ppefront ppebuild ppewildfly\""' >> /root/.zshrc \
    && echo 'alias ppegit="cd /root/projetos/ppe/sinespppe-src && git pull && git push"' >> /root/.zshrc \
    && echo 'alias ppefront="cd /root/projetos/ppe && ./front.sh"' >> /root/.zshrc \
    && echo 'alias ppebuild="cd /root/projetos/ppe && ./ppe-build.sh"' >> /root/.zshrc \
    && echo 'alias ppewildfly="cd /root/projetos/ppe/wildfly && ./killwildfly.sh; ./start.sh"' >> /root/.zshrc

# Config git global
RUN git config --global user.name "Emerson Shigueo Sugimoto" \
    && git config --global user.email "emerson.sugimoto@serpro.gov.br" \
    && git config --global --add safe.directory /projeto \
    && git config --global --add safe.directory /projeto/treeview_angular

# ----------------------------
# Instala o Angular CLI globalmente
# ----------------------------
RUN npm install -g @angular/cli

WORKDIR /projeto/treeview_angular
RUN chsh -s /bin/zsh

EXPOSE 4200
CMD ["zsh"]