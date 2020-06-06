import { ReturnTypeFuncValue, ReturnTypeFunc } from '@nestjs/graphql';

/**
 * A synctatic sugar function which simply takes in a GraphQL type and returns it.
 * This is useful in the context of GraphQL decorators which takes in an anonymous function for annotating a type.
 * You can alias this exported function to an appropriate name like: 'of', 'returns', 'type', etc.
 *
 * @param t The type to return
 * @example
 * // aliased as 'returns'
 * Query(returns(Int), {name: 'numbers'})
 * @example
 * // aliased as 'type'
 * Field(type(Article))
 */
export function returnType(t: ReturnTypeFuncValue): ReturnTypeFunc;
export function returnType(t: any): any {
  return () => t;
}
