#!/bin/bash

echo "🔧 Vercel Deployment Fix Script"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

echo "📋 Available fixes for 'No Output Directory named public found' error:"
echo ""
echo "1. Use current configuration (public-vercel directory)"
echo "2. Use alternative configuration (@vercel/static-build)"
echo "3. Remove vercel.json and use Vercel dashboard settings"
echo "4. Test current build process"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "🔄 Using current configuration..."
        echo "Building with public-vercel output..."
        npm run build:vercel
        if [ $? -eq 0 ]; then
            echo "✅ Build successful! Files are in public-vercel/"
            echo "📤 Deploy with: vercel --prod"
        else
            echo "❌ Build failed. Check the error messages above."
        fi
        ;;
    2)
        echo "🔄 Switching to alternative configuration..."
        cp vercel-alternative.json vercel.json
        echo "✅ Switched to alternative vercel.json"
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ Build successful! Files are in build/"
            echo "📤 Deploy with: vercel --prod"
        else
            echo "❌ Build failed. Check the error messages above."
        fi
        ;;
    3)
        echo "🔄 Removing vercel.json for manual configuration..."
        if [ -f "vercel.json" ]; then
            mv vercel.json vercel.json.backup
            echo "✅ Moved vercel.json to vercel.json.backup"
        fi
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ Build successful! Files are in build/"
            echo "📋 Manual Vercel Dashboard Settings:"
            echo "   - Build Command: npm run build"
            echo "   - Output Directory: build"
            echo "   - Install Command: npm install"
            echo "📤 Deploy with: vercel --prod"
        else
            echo "❌ Build failed. Check the error messages above."
        fi
        ;;
    4)
        echo "🔄 Testing current build process..."
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ Build successful!"
            echo "📁 Build output:"
            ls -la build/
            echo ""
            echo "📋 Vercel Configuration:"
            if [ -f "vercel.json" ]; then
                cat vercel.json
            else
                echo "No vercel.json found"
            fi
        else
            echo "❌ Build failed. Check the error messages above."
        fi
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "🎯 Next Steps:"
echo "1. If build was successful, deploy with: vercel --prod"
echo "2. If deployment still fails, try the Vercel Dashboard method"
echo "3. Check the DEPLOYMENT-GUIDE.md for detailed instructions"
