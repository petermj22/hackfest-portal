# 🔔 Razorpay Webhook Setup Guide - HackFest Portal

## **OVERVIEW** 📋

This guide will help you set up Razorpay webhooks for the HackFest Portal to automatically process payment events and update the database when payments are completed, failed, or authorized.

---

## **STEP 1: ENVIRONMENT VARIABLES SETUP** 🔐

### **Required Environment Variables in Vercel**

Add these environment variables in your Vercel dashboard:

```env
# Existing Variables (should already be set)
VITE_SUPABASE_URL=https://vahakfopvhtayajkwdbb.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RAZORPAY_KEY_ID=rzp_live_b8HS5HxaF3DykF

# New Variables for Webhook Handler
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret-from-razorpay
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
```

### **How to Get Each Variable:**

#### **1. SUPABASE_SERVICE_ROLE_KEY**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the "service_role" key (not the anon key)
3. This key has elevated permissions for server-side operations

#### **2. RAZORPAY_WEBHOOK_SECRET**
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Create a new webhook (see Step 2 below)
3. Copy the generated webhook secret

#### **3. RAZORPAY_KEY_SECRET**
1. Go to Razorpay Dashboard → Settings → API Keys
2. Copy your Key Secret (not the Key ID)
3. This is used for additional verification if needed

---

## **STEP 2: CREATE WEBHOOK IN RAZORPAY DASHBOARD** 🎯

### **Webhook Configuration**

1. **Login to Razorpay Dashboard**
   - Go to: https://dashboard.razorpay.com/
   - Navigate to Settings → Webhooks

2. **Create New Webhook**
   - Click "Create New Webhook"
   - Enter webhook details:

```
Webhook URL: https://your-vercel-app.vercel.app/api/webhooks/razorpay
Active: Yes
```

3. **Select Events to Monitor**
   Enable these events:
   ```
   ✅ payment.authorized
   ✅ payment.captured  
   ✅ payment.failed
   ✅ order.paid
   ```

4. **Save and Copy Secret**
   - Click "Create Webhook"
   - Copy the generated webhook secret
   - Add it to Vercel as `RAZORPAY_WEBHOOK_SECRET`

---

## **STEP 3: ADD ENVIRONMENT VARIABLES TO VERCEL** ⚙️

### **In Vercel Dashboard:**

1. **Go to Project Settings**
   - Select your HackFest Portal project
   - Click "Settings" tab
   - Navigate to "Environment Variables"

2. **Add Each Variable**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environments: ✅ Production ✅ Preview ✅ Development
   
   Name: RAZORPAY_WEBHOOK_SECRET
   Value: your_webhook_secret_here
   Environments: ✅ Production ✅ Preview ✅ Development
   
   Name: RAZORPAY_KEY_SECRET
   Value: your_razorpay_secret_key
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

3. **Redeploy Application**
   - After adding variables, trigger a new deployment
   - Go to Deployments tab → Click "Redeploy"

---

## **STEP 4: TEST WEBHOOK SETUP** 🧪

### **Using Browser Console**

1. **Open your deployed application**
2. **Open browser console (F12)**
3. **Run webhook tests**:

```javascript
// Test webhook endpoint connectivity
webhookTester.testWebhookEndpoint('https://your-vercel-app.vercel.app');

// Check environment configuration
webhookTester.checkWebhookEnvironment();

// Generate webhook configuration for Razorpay
webhookTester.generateWebhookConfig('https://your-vercel-app.vercel.app');

// Run complete test suite
webhookTester.testCompleteWebhookFlow('https://your-vercel-app.vercel.app');
```

### **Expected Test Results**

```
✅ Connectivity: PASS
✅ Mock Event: PASS (signature verification active)
✅ Environment: PASS
Overall Status: ✅ READY
```

---

## **STEP 5: TEST WITH REAL PAYMENTS** 💳

### **Test Payment Flow**

1. **Complete a test payment** in your application
2. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Look for `/api/webhooks/razorpay` function
   - Check logs for webhook events

3. **Verify Database Updates**:
   - Check Supabase payments table
   - Verify payment status is updated
   - Check team status is updated

### **Expected Webhook Flow**

```
1. User initiates payment → Frontend creates order
2. User completes payment → Razorpay sends webhook
3. Webhook handler verifies signature → Updates database
4. Payment status: pending → captured/paid
5. Team status: pending → approved
```

---

## **STEP 6: MONITOR WEBHOOK ACTIVITY** 📊

### **Razorpay Dashboard Monitoring**

1. **Go to Webhooks section**
2. **Click on your webhook**
3. **View delivery logs**:
   - Successful deliveries: 200 status
   - Failed deliveries: Error details
   - Retry attempts

### **Vercel Function Logs**

1. **Go to Vercel Dashboard → Functions**
2. **Click on webhook function**
3. **View real-time logs**:
   ```
   🔔 Webhook received from Razorpay
   ✅ Webhook signature verified
   💰 Processing payment.captured: pay_123456789
   ✅ Payment captured and database updated
   ```

---

## **TROUBLESHOOTING** 🔧

### **Common Issues & Solutions**

#### **1. Webhook Not Receiving Events**
```
Problem: No webhook events in logs
Solutions:
- Check webhook URL is correct
- Verify webhook is active in Razorpay
- Check Vercel function deployment
```

#### **2. Signature Verification Failed**
```
Problem: "Invalid signature" errors
Solutions:
- Verify RAZORPAY_WEBHOOK_SECRET is correct
- Check webhook secret in Razorpay dashboard
- Ensure environment variable is deployed
```

#### **3. Database Update Errors**
```
Problem: "Database update error" in logs
Solutions:
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check Supabase RLS policies allow service role
- Verify payment record exists with correct order_id
```

#### **4. Payment Record Not Found**
```
Problem: "Payment record not found" errors
Solutions:
- Check order_id matches between frontend and webhook
- Verify payment record is created before webhook
- Check transaction_id field in payments table
```

---

## **WEBHOOK HANDLER FEATURES** ⚡

### **Security Features**
- ✅ **Signature Verification** - Validates webhook authenticity
- ✅ **CORS Headers** - Proper cross-origin handling
- ✅ **Method Validation** - Only accepts POST requests
- ✅ **Error Handling** - Comprehensive error logging

### **Event Processing**
- ✅ **payment.captured** - Updates status to 'paid', approves team
- ✅ **payment.failed** - Updates status to 'failed', logs failure reason
- ✅ **payment.authorized** - Updates status to 'authorized'
- ✅ **order.paid** - Updates status to 'completed'

### **Database Integration**
- ✅ **Payment Updates** - Status, transaction ID, gateway response
- ✅ **Team Status** - Automatically approves teams on successful payment
- ✅ **Timestamps** - Tracks captured_at, failed_at, authorized_at
- ✅ **Error Logging** - Stores failure reasons and error details

---

## **WEBHOOK ENDPOINTS** 🌐

### **Production Webhook URL**
```
https://your-vercel-app.vercel.app/api/webhooks/razorpay
```

### **Supported HTTP Methods**
- ✅ **POST** - Process webhook events
- ✅ **OPTIONS** - CORS preflight requests
- ❌ **GET, PUT, DELETE** - Return 405 Method Not Allowed

### **Response Codes**
- **200** - Webhook processed successfully
- **400** - Invalid signature or malformed request
- **405** - Method not allowed
- **500** - Server error during processing

---

## **VERIFICATION CHECKLIST** ✅

### **Setup Complete When:**
- [ ] All environment variables added to Vercel
- [ ] Webhook created in Razorpay dashboard
- [ ] Webhook URL points to your Vercel app
- [ ] Required events are enabled
- [ ] Webhook secret is configured
- [ ] Test webhook shows "READY" status
- [ ] Real payment test updates database
- [ ] Webhook logs show successful processing

### **Production Ready When:**
- [ ] All tests pass
- [ ] Real payments work end-to-end
- [ ] Database updates correctly
- [ ] Team status changes appropriately
- [ ] Error handling works properly
- [ ] Monitoring is in place

**Your Razorpay webhook system is now ready for production! 🚀**
