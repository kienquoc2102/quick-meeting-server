# Sử dụng NodeJS chính thức
FROM node:20

# Set thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Lắng nghe cổng 5090
EXPOSE 5090

# Lệnh chạy server
CMD ["node", "index.js"]
