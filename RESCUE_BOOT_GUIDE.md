# 🛠️ System Rescue & Password Recovery Memory Guide
> **সংরক্ষিত তারিখ:** ২৩ আগস্ট ২০২৬  
> **উদ্দেশ্য:** পিসি রিস্টার্ট বা সেশন পরিবর্তনের পরও যাতে উদ্ধার ও বুট নির্দেশিকা মনে থাকে।

---

## 📌 ১. বর্তমান পেনড্রাইভ ও পার্টিশন সেটআপ
* **পেনড্রাইভ মডেল:** Kingston DataTraveler 3.0 PMAP
* **পার্টিশনসমূহ:**
  1. `Kali Live (D:)` - Kali Linux লাইভ বুট পার্টিশন
  2. `MyData (F:)` - মূল ডেটা পার্টিশন
  3. `RESCUE (G:)` - ৫ জিবি FAT32 পার্টিশন (Hiren's BootCD PE ও Lazesoft টুলস)

---

## 📌 ২. বুট করার সঠিক নিয়ম (GIGABYTE UEFI BIOS)
পিসি অন করার সময় **F12** চাপলে বুট মেনু আসবে:
```text
1. Windows Boot Manager (P4: Apacer AS340 120GB)
2. P4: Apacer AS340 120GB
3. KingstonDataTraveler 3.0PMAP                     <-- [Kali Legacy MBR]
4. UEFI : KingstonDataTraveler 3.0PMAP              <-- [Kali UEFI]
5. UEFI : KingstonDataTraveler 3.0PMAP              <-- [✅ সিলেক্ট করুন: RESCUE / HBCD]
6. Enter Setup
```
> ⚠️ **গুরুত্বপূর্ণ:** তালিকা থেকে **২য় UEFI অপশনটি** (৫ নম্বর লাইন / Enter Setup এর ঠিক উপরেরটি) সিলেক্ট করে `Enter` চাপলে সরাসরি Hiren's PE লোড হবে।

---

## 📌 ৩. Hiren's PE তে পাসওয়ার্ড রিসেট করার ধাপ
1. Hiren's PE ব্লু ডেসকটপ ওপেন হলে Start Menu-তে যান।
2. যান: `All Programs` ➔ `Security` ➔ `Passwords` ➔ **Lazesoft Password Recovery**।
3. **Reset Windows Password** সিলেক্ট করুন ➔ ইউজার অ্যাকাউন্ট সিলেক্ট করুন ➔ **RESET / UNLOCK** ক্লিক করুন।
4. পেনড্রাইভ খুলে পিসি রিস্টার্ট দিন।

---

## 📌 ৪. বিকল্প ব্যাকআপ পদ্ধতি (যদি বুট না হয়)

### ক. উইন্ডোজ থেকেই তাৎক্ষণিক পাসওয়ার্ড মুছে ফেলা (কোনো রিস্টার্ট বা পেনড্রাইভ ছাড়াই):
Command Prompt (Admin) খুলে রান করুন:
```cmd
net user "%USERNAME%" ""
```

### খ. Windows Recovery Device Boot:
`Shift` কি চেপে ধরে Start Menu থেকে `Restart` ➔ `Use a device` ➔ `RESCUE` নির্বাচন করুন।
