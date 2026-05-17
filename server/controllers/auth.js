const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');
    const User = require('../models/User'); // Ensure this matches your file structure
    const jwt = require('jsonwebtoken');
    // --- CONTROLLERS ---
    const register = async (req, res) => {
        try {
            const { firstName, lastName, email, password, role, bio , teacherCode } = req.body;
             
            //  Vérifier format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
             return res.status(400).json({ message: "Email invalide" });
            }

            //  Vérifier mot de passe minimum
            if (!password || password.length < 6) {
              return res.status(400).json({ message: "Mot de passe trop court (min. 6 caractères)" });
            }

            //  Vérifier role valide
            if (!["student", "teacher"].includes(role)) {
               return res.status(400).json({ message: "Rôle invalide" });
            }
            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" }); // Changed 404 to 400 (Bad Request)
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
             

            const TEACHER_SECRET = process.env.TEACHER_SECRET;

              if (role === "teacher") {
              if (!teacherCode || teacherCode !== TEACHER_SECRET) {
              return res.status(403).json({ message: "Code prof invalide" });
                 }
                }
            // Create a new user (Note: naming must match your User Schema exactly)
            const newUser = new User({
                firstName, // Use camelCase to stay consistent
                lastName,
                email,
                password: hashedPassword,
                role: role || 'student',
                bio: bio || '',
                isVerified: false,
            });
            console.log("register was called with:", req.body);
            await newUser.save();
            res.status(201).json({ message: "User created successfully" });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "Something went wrong during registration" });
        }
    };

    const login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Generate Token
            // Including id, role, and name so the frontend doesn't have to fetch them again
            const token = jwt.sign(
                { 
                    id: user._id, 
                    role: user.role, 
                    email: user.email, 
                    firstName: user.firstName, 
                    lastName: user.lastName 
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
            );

            res.status(200).json({ token, user: {
                     id: user._id,
                    role: user.role,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                 }}); 
        } catch (error) {
            res.status(500).json({ message: "Something went wrong during login" });
        }
    };

    const logout = async (req, res) => {
        res.status(200).json({ message: "Logged out successfully (frontend should delete the token)" });
    };
    const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "No token provided" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // Token invalide ou expiré → refuser
            return res.status(401).json({ message: "Token invalide ou expiré" });
        }

        if (!decoded) return res.status(401).json({ message: "Could not decode token" });

        // Vérifier que l'user existe encore en DB
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

        const newToken = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token: newToken });
    } catch (error) {
        res.status(500).json({ message: "Server error during refresh" });
    }
   };
module.exports = {register, login, logout, refreshToken };