#!/bin/bash

echo "Adding attributes to Workshops collection..."

# Workshops collection attributes
appwrite databases create-string-attribute --database-id workshop-platform --collection-id workshops --key title --size 255 --required true
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id workshops --key description --size 5000 --required true
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id workshops --key category --size 100 --required true
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id workshops --key location --size 255 --required true
sleep 2
appwrite databases create-integer-attribute --database-id workshop-platform --collection-id workshops --key price --required false
sleep 2
appwrite databases create-integer-attribute --database-id workshop-platform --collection-id workshops --key capacity --required false
sleep 2
appwrite databases create-enum-attribute --database-id workshop-platform --collection-id workshops --key scheduleType --elements "fixed,flexible" --required true
sleep 2
appwrite databases create-datetime-attribute --database-id workshop-platform --collection-id workshops --key startDate --required false
sleep 2
appwrite databases create-datetime-attribute --database-id workshop-platform --collection-id workshops --key endDate --required false
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id workshops --key applicationForm --size 10000 --required true
sleep 2
appwrite databases create-enum-attribute --database-id workshop-platform --collection-id workshops --key status --elements "draft,published,cancelled" --required true
sleep 2

echo "Adding attributes to Applications collection..."

# Applications collection attributes
appwrite databases create-string-attribute --database-id workshop-platform --collection-id applications --key workshopId --size 36 --required true
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id applications --key studentId --size 36 --required true
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id applications --key responses --size 10000 --required true
sleep 2
appwrite databases create-enum-attribute --database-id workshop-platform --collection-id applications --key status --elements "pending,approved,rejected" --required true
sleep 2

echo "Adding attributes to Payments collection..."

# Payments collection attributes
appwrite databases create-string-attribute --database-id workshop-platform --collection-id payments --key applicationId --size 36 --required true
sleep 2
appwrite databases create-integer-attribute --database-id workshop-platform --collection-id payments --key amount --required true
sleep 2
appwrite databases create-enum-attribute --database-id workshop-platform --collection-id payments --key status --elements "pending,completed,failed" --required true
sleep 2
appwrite databases create-string-attribute --database-id workshop-platform --collection-id payments --key stripePaymentId --size 255 --required false

echo "Schema deployment completed!"