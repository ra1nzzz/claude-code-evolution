---
name: sumra-deploy-verify
description: |
  sumra.shop 部署验证技能。系统性验证部署各阶段的完成度，
  确保所有步骤正确完成、支付通道打通、内容上线就绪。
triggers:
  - 验证部署
  - 检查完成度
  - deployment verify
  - 部署检查
---

# sumra Deploy Verify: sumra.shop 部署完成度验证

## 部署检查清单

对每个 Phase 执行系统性验证，输出报告。

---

### Phase 0: 基础设施验证

- [ ] sumra.shop 域名可解析 → `nslookup sumra.shop`
- [ ] 主机 SSH 登录正常（161.118.176.143）
- [ ] Cloudflare DNS A 记录指向正确 IP
- [ ] SSL 证书生效 → `curl -I https://sumra.shop`

### Phase 1: WordPress 验证

- [ ] https://sumra.shop/wp-admin 可访问
- [ ] WordPress 后台语言为中文（已设置 WPLANG=zh_CN）
- [ ] Astra 主题已激活
- [ ] 固定链接设为 Post Name 格式
- [ ] 数据库连接正常（ wp-admin 正常运行）

### Phase 2: 插件验证

- [ ] WooCommerce 已激活 → wp-admin → WooCommerce
- [ ] 货币设为 USD
- [ ] 运费区域已配置（US + Global）
- [ ] Stripe / PayPal 插件已安装
- [ ] Paid Memberships Pro 已激活
- [ ] Yoast SEO 已激活
- [ ] Wordfence 已激活
- [ ] UpdraftPlus 已激活

### Phase 3: 支付验证

- [ ] Stripe API 密钥已配置（测试模式）
- [ ] PayPal Business 已对接
- [ ] 测试订单完成（使用 Stripe/PayPal 测试卡）

### Phase 4: 内容验证

- [ ] 至少 1 本小说已在站（10+ 章节）
- [ ] 付费章节设置了访问限制
- [ ] 商品至少 5 个 SKU 已上架
- [ ] 商品价格合理（AliExpress 采购价 × 2.8）

### Phase 5: 合规与安全

- [ ] Privacy Policy 页面已创建
- [ ] Terms of Service 页面已创建
- [ ] Cookie Consent Banner 已安装
- [ ] Wordfence 防火墙开启
- [ ] SSL 证书有效且自动续期已配置

---

## 验证流程

### Step 1: SSH 检查服务器状态
```bash
ssh -i ~/.ssh/kr2vps opc@161.118.176.143
# 检查 Nginx, PHP-FPM, MySQL 状态
systemctl status nginx php-fpm mysqld
# 检查 SSL
certbot certificates
```

### Step 2: WP-CLI 检查 WordPress 状态
```bash
ssh -i ~/.ssh/kr2vps opc@161.118.176.143 \
  "sudo -u nginx /usr/local/bin/wp --path=/var/www/sumra.shop plugin list --allow-root"
```

### Step 3: 浏览器访问验证
- https://sumra.shop/ — 首页可见
- https://sumra.shop/wp-admin — 登录正常
- https://sumra.shop/shop — WooCommerce 商品页正常

---

## 输出格式

```
## sumra.shop 部署验证报告

### ✅ 已完成
- [已通过的检查项]

### ⚠️ 待处理
- [未完成但影响较小的项]
- 建议：[具体操作建议]

### ❌ 阻塞项
- [必须修复才能上线的项]
- 负责人：sumra-shop / Lucy / 韬哥

### 总体进度
[XX/YY] 项已完成
```

## 使用

```
/verify deploy     # 验证完整部署
/verify payment     # 仅验证支付通道
/verify content     # 仅验证内容上线
```
