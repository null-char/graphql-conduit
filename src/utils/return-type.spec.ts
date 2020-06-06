import { returnType } from '@/utils/return-type';
import { Int, ReturnTypeFuncValue, ReturnTypeFunc } from '@nestjs/graphql';

describe('returnType', () => {
  it('returns a graphql type func given a type as input', () => {
    const graphQLType: ReturnTypeFuncValue = [Int];
    const typeFunc: ReturnTypeFunc = returnType(graphQLType);
    expect(typeof typeFunc).toBe('function');
    expect(typeFunc()).toBe(graphQLType);
  });
});
