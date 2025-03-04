import React, { useState } from "react";
import { View, Text, TextInput, Dimensions, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { PieChart } from "react-native-chart-kit";

const MortgageCalculator = () => {
    const [totalPrice, setTotalPrice] = useState(5000000); // Default ₹50 Lakhs
    const [loanPeriod, setLoanPeriod] = useState(20); // Default 20 Years
    const [downPayment, setDownPayment] = useState(1000000); // ₹10 Lakhs
    const [interestRate, setInterestRate] = useState(8.5); // 8.5%

    // Loan Amount after Down Payment
    const loanAmount = totalPrice - downPayment;

    // Monthly Interest Rate
    const monthlyRate = (interestRate / 100) / 12;

    // Number of Payments (Months)
    const numPayments = loanPeriod * 12;

    // EMI Calculation Formula
    const monthlyPayment =
        (loanAmount * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -numPayments));

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    return (
        <View className="border rounded-lg border-gray-300" style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
                🏡 Mortgage Calculator
            </Text>

            {/* Total Price */}
            <View>
                <Text>Total Price (₹): {totalPrice.toLocaleString()}</Text>
                <Slider
                    minimumValue={1000000}
                    maximumValue={100000000}
                    step={500000}
                    value={totalPrice}
                    onValueChange={setTotalPrice}
                />
                <TextInput 
                    style={styles.input} 
                    keyboardType="numeric"
                    value={totalPrice.toString()} 
                    onChangeText={(text) => setTotalPrice(parseInt(text) || 0)}
                />
            </View>

            {/* Loan Period */}
            <View>
                <Text>Loan Period (Years): {loanPeriod}</Text>
                <Slider
                    minimumValue={5}
                    maximumValue={30}
                    step={1}
                    value={loanPeriod}
                    onValueChange={setLoanPeriod}
                />
                <TextInput 
                    style={styles.input} 
                    keyboardType="numeric"
                    value={loanPeriod.toString()} 
                    onChangeText={(text) => setLoanPeriod(parseInt(text) || 0)}
                />
            </View>

            {/* Down Payment */}
            <View>
                <Text>Down Payment (₹): {downPayment.toLocaleString()}</Text>
                <Slider
                    minimumValue={500000}
                    maximumValue={totalPrice}
                    step={500000}
                    value={downPayment}
                    onValueChange={setDownPayment}
                />
                <TextInput 
                    style={styles.input} 
                    keyboardType="numeric"
                    value={downPayment.toString()} 
                    onChangeText={(text) => setDownPayment(parseInt(text) || 0)}
                />
            </View>

            {/* Interest Rate */}
            <View>
                <Text>Interest Rate (%): {interestRate.toFixed(2)}</Text>
                <Slider
                    minimumValue={5}
                    maximumValue={15}
                    step={0.1}
                    value={interestRate}
                    onValueChange={setInterestRate}
                />
                <TextInput 
                    style={styles.input} 
                    keyboardType="numeric"
                    value={interestRate.toString()} 
                    onChangeText={(text) => setInterestRate(parseFloat(text) || 0)}
                />
            </View>

            {/* Monthly Payment & Total Payment */}
            <View style={{ padding: 20, marginTop: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Results:</Text>
                <Text>📅 Monthly Payment: ₹{monthlyPayment.toFixed(0).toLocaleString()}</Text>
                <Text>💰 Total Payment: ₹{totalPayment.toFixed(0).toLocaleString()}</Text>
            </View>

            {/* Pie Chart for Principal & Interest */}
            <PieChart
                data={[
                    { name: "Principal", amount: loanAmount, color: "#4CAF50", legendFontColor: "#000", legendFontSize: 14 },
                    { name: "Interest", amount: totalInterest, color: "#FF5722", legendFontColor: "#000", legendFontSize: 14 }
                ]}
                width={Dimensions.get("window").width - 40}
                height={220}
                chartConfig={{ color: () => `rgba(0,0,0,0.8)` }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="10"
            />
        </View>
    );
};

export default MortgageCalculator;

const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 20,
    },
});
