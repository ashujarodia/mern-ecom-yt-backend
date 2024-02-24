import { stripe } from '../app.js';
import { TryCatch } from '../middlewares/error.js';
import { Coupen } from '../models/coupen.js';
import ErrorHandler from '../utils/utility-class.js';

export const createPaymentIntent = TryCatch(async (req, res, next) => {
	const { amount } = req.body;
	if (!amount) {
		return next(new ErrorHandler('Please enter amount', 400));
	}
	const paymentIntent = await stripe.paymentIntents.create({ amount: Number(amount) * 100, currency: 'inr' });

	return res.status(201).json({
		success: true,
		clientSecret: paymentIntent.client_secret,
	});
});

export const newCoupon = TryCatch(async (req, res, next) => {
	const { code, amount } = req.body;
	if (!code || !amount) {
		return next(new ErrorHandler('Please enter both coupon and amount', 400));
	}
	await Coupen.create({ code, amount });
	return res.status(201).json({
		success: true,
		message: `Coupen ${code} created successfully`,
	});
});

export const applyDiscount = TryCatch(async (req, res, next) => {
	const { code } = req.query;
	if (!code) {
		return next(new ErrorHandler('Please enter coupon code', 400));
	}
	const discount = await Coupen.findOne({ code });
	if (!discount) {
		return next(new ErrorHandler('Invalid coupon code', 400));
	}
	return res.status(200).json({
		success: true,
		discount: discount.amount,
	});
});

export const allCoupens = TryCatch(async (req, res, next) => {
	const coupons = await Coupen.find({});
	return res.status(200).json({
		success: true,
		coupons,
	});
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
	const { id } = req.params;
	const coupon = await Coupen.findByIdAndDelete(id);
	if (!coupon) {
		return next(new ErrorHandler('Invalid coupon ID', 400));
	}
	return res.status(200).json({
		success: true,
		message: `Coupon ${coupon?.code} deleted successfully`,
	});
});